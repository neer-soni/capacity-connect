"use client";
import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ShieldCheck, AlertTriangle, Eye, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";

interface Report {
  id: string;
  contentType: string;
  contentId: string;
  reportedBy: string;
  reportedUser: string;
  reason: string;
  status: string;
  resolvedAction: string;
  courseContext: string;
  createdAt: string;
  reporter: {
    id: string;
    name: string;
  };
}

const statusColors: Record<string, string> = {
  pending: "badge-warning",
  resolved: "badge-success",
  dismissed: "badge-muted",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      }
    } catch {
      console.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleAction = async (reportId: string, action: "dismiss" | "remove") => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        await fetchReports();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update report");
      }
    } catch {
      alert("Network error");
    }
  };

  const pending = reports.filter((r) => r.status === "pending");
  const resolved = reports.filter((r) => r.status !== "pending");

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Moderation Queue</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 28 }}>Review flagged forum content across all course discussions</p>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Loader2 size={32} className="spinner" style={{ color: "hsl(215 84% 52%)" }} />
        </div>
      ) : reports.length === 0 ? (
        <div className="empty-state" style={{ padding: "60px 24px" }}>
          <ShieldCheck size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>All Clear</h3>
          <p style={{ fontSize: "0.85rem", color: "hsl(215 16% 57%)" }}>No forum content has been reported yet.</p>
        </div>
      ) : (
        <>
          {/* Pending reports */}
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={16} style={{ color: "hsl(38 80% 40%)" }} />
            Pending Reports ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <div className="card" style={{ padding: "24px", marginBottom: 32, textAlign: "center" }}>
              <p style={{ fontSize: "0.85rem", color: "hsl(215 16% 57%)" }}>No pending reports 🎉</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {pending.map((report, i) => (
                <div key={report.id} className="card animate-fade-in" style={{ padding: "20px", borderLeft: "3px solid hsl(38 95% 55%)", animationDelay: `${i * 0.05}s` }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "hsl(0 72% 96%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <AlertTriangle size={20} style={{ color: "hsl(0 72% 51%)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span className={`badge ${statusColors[report.status]}`} style={{ fontSize: "0.7rem" }}>{report.status}</span>
                        <span className="badge badge-muted" style={{ fontSize: "0.7rem" }}>{report.contentType.replace("_", " ")}</span>
                        <span className="badge badge-error" style={{ fontSize: "0.7rem" }}>{report.reason}</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)", lineHeight: 1.6 }}>
                        <span>Reported by: <strong>{report.reporter?.name || report.reportedBy}</strong></span>
                        {report.reportedUser && (
                          <>
                            <span style={{ margin: "0 8px" }}>·</span>
                            <span>Against: <strong>{report.reportedUser}</strong></span>
                          </>
                        )}
                        {report.courseContext && (
                          <>
                            <span style={{ margin: "0 8px" }}>·</span>
                            <span>In: <em>{report.courseContext}</em></span>
                          </>
                        )}
                        <span style={{ margin: "0 8px" }}>·</span>
                        <span>{new Date(report.createdAt).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                      <button
                        className="btn btn-sm"
                        style={{ background: "hsl(145 63% 40%)", color: "white", fontSize: "0.72rem" }}
                        onClick={() => handleAction(report.id, "dismiss")}
                      >
                        <CheckCircle size={13} /> Dismiss
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: "hsl(0 72% 51%)", color: "white", fontSize: "0.72rem" }}
                        onClick={() => handleAction(report.id, "remove")}
                      >
                        <Trash2 size={13} /> Remove Content
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resolved */}
          {resolved.length > 0 && (
            <>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle size={16} style={{ color: "hsl(145 63% 40%)" }} />
                Resolved ({resolved.length})
              </h2>
              <div className="card" style={{ overflow: "hidden" }}>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>Type</th><th>Reason</th><th>Reported By</th><th>Course</th><th>Action Taken</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {resolved.map((r) => (
                        <tr key={r.id}>
                          <td><span className="badge badge-muted" style={{ fontSize: "0.7rem" }}>{r.contentType.replace("_", " ")}</span></td>
                          <td><span className="badge badge-error" style={{ fontSize: "0.7rem" }}>{r.reason}</span></td>
                          <td>{r.reporter?.name || r.reportedBy}</td>
                          <td style={{ fontSize: "0.82rem" }}>{r.courseContext}</td>
                          <td><span className="badge badge-success" style={{ fontSize: "0.7rem" }}>{r.resolvedAction || "Resolved"}</span></td>
                          <td style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
