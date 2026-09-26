"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { CheckCircle, XCircle, Eye, Clock, Loader } from "lucide-react";

interface CourseItem {
  id: string;
  title: string;
  description: string;
  department: string;
  level: string;
  duration: string;
  status: string;
  thumbnail: string;
  totalLessons: number;
  trainer: string;
  trainerAvatar: string;
  enrolledCount: number;
  resourceCount: number;
  rating: number;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      }
    } catch {}
    setLoading(false);
  }

  async function handleAction(courseId: string, action: "approve" | "reject") {
    setActing(courseId);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        // Refresh the list after action
        await fetchCourses();
      } else {
        const data = await res.json();
        alert(data.error || "Action failed. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setActing(null);
  }

  const pending = courses.filter((c) => c.status === "draft" || c.status === "pending");
  const published = courses.filter((c) => c.status === "published");

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Course Validation</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 28 }}>
        Review and approve trainer-submitted courses before they go live
      </p>

      {loading ? (
        <div className="card" style={{ padding: 48, textAlign: "center", color: "hsl(215 16% 57%)" }}>
          Loading courses...
        </div>
      ) : (
        <>
          {/* Pending */}
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>
            <Clock size={16} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 6 }} />
            Pending Review ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <div className="card" style={{ padding: "24px", textAlign: "center", marginBottom: 28, color: "hsl(215 16% 57%)" }}>
              ✓ No courses pending review
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {pending.map((c) => (
                <div key={c.id} className="card animate-fade-in" style={{ padding: "20px", display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ fontSize: "2rem", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(210 20% 96%)", borderRadius: 10 }}>
                    {c.thumbnail}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                      <span className="badge badge-warning" style={{ fontSize: "0.7rem" }}>Pending</span>
                      <span className="badge badge-muted" style={{ fontSize: "0.7rem" }}>{c.level}</span>
                    </div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4 }}>{c.title}</h3>
                    <p style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>
                      By {c.trainer} · {c.department} · {c.totalLessons} lessons · {c.duration} · {c.resourceCount} media files
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {acting === c.id ? (
                      <span style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)", display: "flex", alignItems: "center", gap: 6 }}>
                        <Loader size={14} className="spin" /> Processing...
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction(c.id, "approve")}
                          className="btn btn-sm"
                          style={{ background: "hsl(145 63% 40%)", color: "white" }}
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleAction(c.id, "reject")}
                          className="btn btn-sm"
                          style={{ background: "hsl(0 72% 51%)", color: "white" }}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Published */}
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>
            <CheckCircle size={16} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 6, color: "hsl(145 63% 40%)" }} />
            Published ({published.length})
          </h2>
          {published.length === 0 ? (
            <div className="card" style={{ padding: "24px", textAlign: "center", color: "hsl(215 16% 57%)" }}>
              No published courses yet
            </div>
          ) : (
            <div className="card" style={{ overflow: "hidden" }}>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Trainer</th>
                      <th>Department</th>
                      <th>Enrolled</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {published.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.thumbnail} {c.title}</td>
                        <td>{c.trainer}</td>
                        <td>{c.department}</td>
                        <td>{c.enrolledCount}</td>
                        <td style={{ fontWeight: 600, color: "hsl(38 80% 35%)" }}>
                          {c.rating > 0 ? `⭐ ${c.rating}` : "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <Link href={`/admin/courses/${c.id}/report`} className="btn btn-ghost btn-sm">
                              Report
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}