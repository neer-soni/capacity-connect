"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MediaUploader from "@/components/media/MediaUploader";
import { Upload, FileText, Video, Image, Trash2, Download, Eye, HardDrive, X } from "lucide-react";

interface LibraryResource {
  id: string;
  title: string;
  type: string;
  size: string;
  sizeBytes: number;
  mimeType: string;
  url: string;
  storageKey: string;
  duration: string;
  course?: { id: string; title: string };
  uploadedAt?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  video: <Video size={18} style={{ color: "hsl(215 84% 30%)" }} />,
  pdf: <FileText size={18} style={{ color: "hsl(0 72% 51%)" }} />,
  slide: <Image size={18} style={{ color: "hsl(38 80% 40%)" }} />,
};

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TrainerLibraryPage() {
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "video" | "pdf" | "slide">("all");

  useEffect(() => {
    fetchResources();
    fetchCourses();
  }, []);

  async function fetchResources() {
    setLoading(true);
    try {
      const res = await fetch("/api/trainer/resources");
      if (res.ok) {
        const data = await res.json();
        setResources(Array.isArray(data) ? data : []);
      }
    } catch {}
    setLoading(false);
  }

  async function fetchCourses() {
    try {
      const res = await fetch("/api/trainer/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data.map((c: any) => ({ id: c.id, title: c.title })) : []);
      }
    } catch {}
  }

  async function handleDelete(resource: LibraryResource) {
    if (!confirm(`Delete "${resource.title}"? This cannot be undone.`)) return;
    setDeleting(resource.id);
    try {
      await fetch(`/api/upload?key=${encodeURIComponent(resource.storageKey)}&resourceId=${resource.id}`, {
        method: "DELETE",
      });
      setResources((prev) => prev.filter((r) => r.id !== resource.id));
    } catch {
      alert("Delete failed. Please try again.");
    }
    setDeleting(null);
  }

  const filtered = filter === "all" ? resources : resources.filter((r) => r.type === filter);
  const totalSize = resources.reduce((sum, r) => sum + (r.sizeBytes || 0), 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>Media Library</h1>
          <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem" }}>
            Upload and manage lecture videos, PDFs, and presentation slides
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          <Upload size={16} /> Upload Files
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid-4-auto" style={{ marginBottom: 24 }}>
        {[
          { label: "Total Files", value: resources.length, icon: "📁" },
          { label: "Videos", value: resources.filter((r) => r.type === "video").length, icon: "🎬" },
          { label: "Documents", value: resources.filter((r) => r.type !== "video").length, icon: "📄" },
          { label: "Total Size", value: formatBytes(totalSize), icon: "💾" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", color: "hsl(215 18% 38%)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {(["all", "video", "pdf", "slide"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={filter === t ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
            style={{ textTransform: "capitalize" }}
          >
            {t === "all" ? "All Files" : t === "video" ? "🎬 Videos" : t === "pdf" ? "📄 PDFs" : "📊 Slides"}
          </button>
        ))}
      </div>

      {/* Inline upload drop-zone (collapsed by default) */}
      {showUploadModal && (
        <div className="card" style={{ padding: "24px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>Upload New Files</h3>
            <button onClick={() => setShowUploadModal(false)} className="btn btn-ghost btn-sm">
              <X size={16} />
            </button>
          </div>

          {/* Course selector */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6, color: "hsl(215 18% 38%)" }}>
              Attach to Course (optional)
            </label>
            <select
              className="input"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              style={{ maxWidth: 360 }}
            >
              <option value="">— Select a course —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <MediaUploader
            courseId={selectedCourseId || undefined}
            purpose="resource"
            maxFiles={20}
            onUploadComplete={() => {
              fetchResources();
            }}
          />
        </div>
      )}

      {/* File list */}
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "hsl(215 16% 57%)" }}>
            Loading your media library...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: "60px 24px" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>📭</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>
              {filter === "all" ? "No files uploaded yet" : `No ${filter} files yet`}
            </h3>
            <p style={{ fontSize: "0.85rem", marginBottom: 20 }}>
              Upload lecture videos, PDFs, and slides to build your course library.
            </p>
            <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
              <Upload size={15} /> Upload First File
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Course</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((file, i) => (
                  <tr key={file.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
                        {typeIcons[file.type] || typeIcons["pdf"]}
                        <span style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {file.title}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${file.type === "video" ? "badge-primary" : file.type === "pdf" ? "badge-error" : "badge-warning"}`} style={{ fontSize: "0.7rem" }}>
                        {file.type?.toUpperCase() || "FILE"}
                      </span>
                    </td>
                    <td style={{ color: "hsl(215 16% 57%)" }}>
                      {file.size || formatBytes(file.sizeBytes)}
                    </td>
                    <td>
                      {file.course ? (
                        <span style={{ fontSize: "0.8rem", color: "hsl(215 18% 38%)" }}>{file.course.title}</span>
                      ) : (
                        <span style={{ color: "hsl(215 16% 65%)", fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ color: "hsl(215 16% 57%)" }}>
                      {file.type === "video" ? (file.duration || "—") : "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {file.url && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            title="Preview"
                          >
                            <Eye size={14} />
                          </a>
                        )}
                        {file.url && (
                          <a
                            href={file.url}
                            download={file.title}
                            className="btn btn-ghost btn-sm"
                            title="Download"
                          >
                            <Download size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(file)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: deleting === file.id ? "hsl(215 16% 57%)" : "hsl(0 72% 51%)" }}
                          disabled={deleting === file.id}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
