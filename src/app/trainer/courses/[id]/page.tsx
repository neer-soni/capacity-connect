"use client";
import { use, useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MediaUploader from "@/components/media/MediaUploader";
import Link from "next/link";
import {
  ArrowLeft, Video, FileText, BookOpen, Trash2, Eye,
  Download, Upload, CheckCircle, Clock, Users, Star,
} from "lucide-react";

interface Resource {
  id: string;
  type: string;
  title: string;
  url: string;
  storageKey: string;
  mimeType: string;
  size: string;
  sizeBytes: number;
  duration: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  department: string;
  level: string;
  duration: string;
  status: string;
  thumbnail: string;
  enrolledCount: number;
  rating: number;
  resources: Resource[];
}

function typeIcon(type: string) {
  if (type === "video") return <Video size={17} style={{ color: "hsl(215 84% 30%)" }} />;
  if (type === "pdf") return <FileText size={17} style={{ color: "hsl(0 72% 51%)" }} />;
  return <BookOpen size={17} style={{ color: "hsl(38 80% 40%)" }} />;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TrainerCourseManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
      }
    } catch {}
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  async function handleDelete(resource: Resource) {
    if (!confirm(`Delete "${resource.title}"? This cannot be undone.`)) return;
    setDeleting(resource.id);
    try {
      await fetch(
        `/api/upload?key=${encodeURIComponent(resource.storageKey)}&resourceId=${resource.id}`,
        { method: "DELETE" }
      );
      setCourse((prev) =>
        prev ? { ...prev, resources: prev.resources.filter((r) => r.id !== resource.id) } : prev
      );
    } catch {
      alert("Delete failed. Please try again.");
    }
    setDeleting(null);
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "80px 20px", color: "hsl(215 16% 57%)" }}>
          Loading course...
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 8 }}>Course Not Found</h2>
          <Link href="/trainer/courses" className="btn btn-primary">Back to My Courses</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Link
        href="/trainer/courses"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "hsl(215 16% 57%)", fontSize: "0.85rem", textDecoration: "none", marginBottom: 16,
        }}
      >
        <ArrowLeft size={14} /> Back to My Courses
      </Link>

      <div className="card" style={{ padding: "24px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ fontSize: "3rem", flexShrink: 0 }}>{course.thumbnail}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <span className={`badge ${course.status === "published" ? "badge-success" : "badge-warning"}`} style={{ fontSize: "0.7rem" }}>
                {course.status}
              </span>
              <span className="badge badge-primary" style={{ fontSize: "0.7rem" }}>{course.level}</span>
              <span className="badge badge-muted" style={{ fontSize: "0.7rem" }}>{course.department}</span>
            </div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 8 }}>{course.title}</h1>
            <p style={{ fontSize: "0.88rem", color: "hsl(215 16% 57%)", marginBottom: 14, lineHeight: 1.6 }}>
              {course.description}
            </p>
            <div style={{ display: "flex", gap: 18, fontSize: "0.82rem", color: "hsl(215 18% 38%)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Users size={14} /> {course.enrolledCount} enrolled
              </span>
              {course.rating > 0 && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Star size={14} style={{ color: "hsl(38 80% 40%)" }} /> {course.rating}
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={14} /> {course.duration}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle size={14} /> {course.resources.length} lessons uploaded
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 2 }}>Course Media</h2>
          <p style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>
            Visible to all enrolled trainees in the Learn page
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href={`/trainer/courses/${id}/report`} className="btn btn-outline">
            <Users size={15} /> View Trainee Report
          </Link>
          <button className="btn btn-primary" onClick={() => setShowUploader((v) => !v)}>
            <Upload size={15} /> {showUploader ? "Cancel" : "Upload Media"}
          </button>
        </div>
      </div>

      {showUploader && (
        <div className="card animate-fade-in" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 14 }}>
            Upload files to &quot;{course.title}&quot;
          </h3>
          <MediaUploader
            courseId={id}
            purpose="resource"
            maxFiles={10}
            onUploadComplete={() => { setShowUploader(false); fetchCourse(); }}
          />
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        {course.resources.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>📭</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No media uploaded yet</h3>
            <p style={{ fontSize: "0.85rem", color: "hsl(215 16% 57%)", marginBottom: 20 }}>
              Upload videos, PDFs or slides — trainees will see them in the Learn page.
            </p>
            <button className="btn btn-primary" onClick={() => setShowUploader(true)}>
              <Upload size={15} /> Upload First File
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Lesson / File</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {course.resources.map((r, i) => (
                  <tr key={r.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
                        {typeIcon(r.type)}
                        <span style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.title}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${r.type === "video" ? "badge-primary" : r.type === "pdf" ? "badge-error" : "badge-warning"}`} style={{ fontSize: "0.7rem" }}>
                        {r.type?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: "hsl(215 16% 57%)", fontSize: "0.85rem" }}>
                      {r.size || formatBytes(r.sizeBytes)}
                    </td>
                    <td style={{ color: "hsl(215 16% 57%)", fontSize: "0.85rem" }}>
                      {r.type === "video" ? (r.duration || "—") : "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {r.url && (
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" title="Preview">
                            <Eye size={14} />
                          </a>
                        )}
                        {r.url && (
                          <a href={r.url} download={r.title} className="btn btn-ghost btn-sm" title="Download">
                            <Download size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(r)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: deleting === r.id ? "hsl(215 16% 57%)" : "hsl(0 72% 51%)" }}
                          disabled={deleting === r.id}
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