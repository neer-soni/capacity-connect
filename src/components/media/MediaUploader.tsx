"use client";
import { useRef, useState, useCallback, useId } from "react";
import { Upload, X, FileText, Video, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number; // 0-100 simulated
  url?: string;
  resourceId?: string;
  error?: string;
}

interface MediaUploaderProps {
  courseId?: string;
  purpose?: "resource" | "avatar" | "thumbnail";
  accept?: string;
  maxFiles?: number;
  onUploadComplete?: (url: string, resourceId?: string) => void;
  /** If true, shows only a compact single-file picker (for avatars/thumbnails) */
  compact?: boolean;
  label?: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  "video": <Video size={18} style={{ color: "hsl(215 84% 45%)" }} />,
  "pdf": <FileText size={18} style={{ color: "hsl(0 72% 51%)" }} />,
  "slide": <FileText size={18} style={{ color: "hsl(38 80% 40%)" }} />,
  "image": <ImageIcon size={18} style={{ color: "hsl(145 63% 40%)" }} />,
};

function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "slide";
  if (mimeType.startsWith("image/")) return "image";
  return "pdf";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaUploader({
  courseId,
  purpose = "resource",
  accept = "video/mp4,video/webm,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/jpeg,image/png,image/webp",
  maxFiles = 10,
  onUploadComplete,
  compact = false,
  label,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const uid = useId();

  const addFiles = useCallback((rawFiles: FileList | File[]) => {
    const arr = Array.from(rawFiles);
    const newEntries: UploadedFile[] = arr.map((file) => ({
      id: `${uid}-${Date.now()}-${Math.random()}`,
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      status: "pending",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newEntries].slice(0, maxFiles));
    // Kick off uploads immediately
    newEntries.forEach((entry) => uploadFile(entry));
  }, [courseId, purpose, uid, maxFiles]); // eslint-disable-line

  const uploadFile = async (entry: UploadedFile) => {
    setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, status: "uploading", progress: 10 } : f));

    const formData = new FormData();
    formData.append("file", entry.file);
    if (courseId) formData.append("courseId", courseId);
    formData.append("purpose", purpose);

    // Simulate progressive upload progress (XHR would give real progress)
    const progressInterval = setInterval(() => {
      setFiles((prev) => prev.map((f) => f.id === entry.id && f.progress < 85
        ? { ...f, progress: Math.min(85, f.progress + 15) }
        : f
      ));
    }, 400);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      clearInterval(progressInterval);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await response.json();
      setFiles((prev) => prev.map((f) =>
        f.id === entry.id
          ? { ...f, status: "done", progress: 100, url: data.url, resourceId: data.resource?.id }
          : f
      ));
      onUploadComplete?.(data.url, data.resource?.id);
    } catch (err: any) {
      clearInterval(progressInterval);
      setFiles((prev) => prev.map((f) =>
        f.id === entry.id ? { ...f, status: "error", progress: 0, error: err.message } : f
      ));
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = ""; // Reset to allow re-selecting same file
  };

  if (compact) {
    return (
      <div>
        {label && <div style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 8, color: "hsl(215 18% 38%)" }}>{label}</div>}
        <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={handleInputChange} />
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            border: "2px dashed hsl(214 20% 85%)",
            borderRadius: 10,
            padding: "24px 16px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.15s",
            background: dragging ? "hsl(215 84% 97%)" : "hsl(210 20% 99%)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "hsl(215 84% 60%)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "hsl(214 20% 85%)")}
        >
          <Upload size={22} style={{ color: "hsl(215 16% 65%)", marginBottom: 8 }} />
          <div style={{ fontSize: "0.82rem", color: "hsl(215 18% 38%)" }}>Click to upload</div>
        </div>
        {files.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {files.map((f) => (
              <FileRow key={f.id} file={f} onRemove={removeFile} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "hsl(215 84% 60%)" : "hsl(214 20% 85%)"}`,
          borderRadius: 12,
          padding: "36px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          background: dragging ? "hsl(215 84% 97%)" : "hsl(210 20% 99%)",
          marginBottom: files.length > 0 ? 16 : 0,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          style={{ display: "none" }}
          onChange={handleInputChange}
          id={`${uid}-input`}
        />
        <Upload
          size={36}
          style={{
            color: dragging ? "hsl(215 84% 45%)" : "hsl(215 16% 65%)",
            marginBottom: 12,
            transition: "color 0.2s",
          }}
        />
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 6, color: dragging ? "hsl(215 84% 30%)" : "hsl(215 30% 20%)" }}>
          {dragging ? "Drop files here" : "Drag & drop files to upload"}
        </h3>
        <p style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)", marginBottom: 12 }}>
          or click to browse your computer
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <span className="badge badge-primary" style={{ fontSize: "0.7rem" }}>🎬 MP4 / WebM</span>
          <span className="badge badge-error" style={{ fontSize: "0.7rem" }}>📄 PDF</span>
          <span className="badge badge-warning" style={{ fontSize: "0.7rem" }}>📊 PPTX</span>
          <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>🖼 JPG / PNG</span>
        </div>
        <p style={{ fontSize: "0.72rem", color: "hsl(215 16% 65%)", marginTop: 10 }}>
          Max: 250 MB for videos · 50 MB for documents · 5 MB for images
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {files.map((f) => (
            <FileRow key={f.id} file={f} onRemove={removeFile} />
          ))}
        </div>
      )}
    </div>
  );
}

function FileRow({ file, onRemove }: { file: UploadedFile; onRemove: (id: string) => void }) {
  const category = getFileCategory(file.file.type);
  const icon = TYPE_ICONS[category] || TYPE_ICONS["pdf"];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 14px",
      borderRadius: 10,
      border: "1px solid hsl(214 20% 90%)",
      background: file.status === "error" ? "hsl(0 72% 98%)" : file.status === "done" ? "hsl(145 63% 98%)" : "hsl(210 20% 99%)",
      transition: "background 0.2s",
    }}>
      {/* Preview / Icon */}
      {file.preview ? (
        <img src={file.preview} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
      ) : (
        <div style={{ flexShrink: 0 }}>{icon}</div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.83rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {file.file.name}
        </div>
        <div style={{ fontSize: "0.72rem", color: "hsl(215 16% 57%)" }}>
          {formatBytes(file.file.size)}
          {file.error && <span style={{ color: "hsl(0 72% 45%)", marginLeft: 8 }}>· {file.error}</span>}
        </div>

        {/* Progress bar */}
        {file.status === "uploading" && (
          <div style={{ marginTop: 5, height: 3, background: "hsl(214 20% 90%)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${file.progress}%`, background: "hsl(215 84% 45%)", borderRadius: 99, transition: "width 0.3s" }} />
          </div>
        )}
      </div>

      {/* Status icon */}
      <div style={{ flexShrink: 0 }}>
        {file.status === "uploading" && <Loader2 size={16} style={{ color: "hsl(215 84% 45%)", animation: "spin 1s linear infinite" }} />}
        {file.status === "done" && <CheckCircle size={16} style={{ color: "hsl(145 63% 40%)" }} />}
        {file.status === "error" && <AlertCircle size={16} style={{ color: "hsl(0 72% 51%)" }} />}
      </div>

      {/* Remove */}
      {file.status !== "uploading" && (
        <button onClick={() => onRemove(file.id)} className="btn btn-ghost btn-sm" style={{ padding: "4px", flexShrink: 0 }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}
