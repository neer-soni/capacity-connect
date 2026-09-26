"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ShieldCheck, AlertTriangle, Eye, CheckCircle, XCircle, Trash2 } from "lucide-react";

const mockReports = [
  { id: "r1", type: "forum_reply", content: "Inappropriate language in reply", reportedBy: "Sneha Patel", reportedUser: "Unknown User", reason: "Offensive language", status: "pending", createdAt: "2024-09-10", courseContext: "Introduction to Oceanography" },
  { id: "r2", type: "forum_thread", content: "Spam promotional link posted", reportedBy: "Amit Verma", reportedUser: "Bot Account", reason: "Spam", status: "pending", createdAt: "2024-09-09", courseContext: "Climate Change & Earth Systems" },
  { id: "r3", type: "forum_reply", content: "Misleading scientific claims without citation", reportedBy: "Dr. Rajesh Kumar", reportedUser: "Rahul Desai", reason: "Misinformation", status: "pending", createdAt: "2024-09-08", courseContext: "Atmospheric Sciences Fundamentals" },
  { id: "r4", type: "forum_thread", content: "Duplicate thread posted 5 times", reportedBy: "Priya Sharma", reportedUser: "Mohan Gupta", reason: "Spam / Duplicate", status: "resolved", createdAt: "2024-09-05", courseContext: "Introduction to Oceanography", resolvedAction: "Content removed" },
];

const statusColors: Record<string, string> = {
  pending: "badge-warning",
  resolved: "badge-success",
  dismissed: "badge-muted",
};

export default function AdminReportsPage() {
  const pending = mockReports.filter((r) => r.status === "pending");
  const resolved = mockReports.filter((r) => r.status !== "pending");

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Moderation Queue</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 28 }}>Review flagged forum content across all course discussions</p>

      {/* Pending reports */}
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <AlertTriangle size={16} style={{ color: "hsl(38 80% 40%)" }} />
        Pending Reports ({pending.length})
      </h2>
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
                  <span className="badge badge-muted" style={{ fontSize: "0.7rem" }}>{report.type.replace("_", " ")}</span>
                  <span className="badge badge-error" style={{ fontSize: "0.7rem" }}>{report.reason}</span>
                </div>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 4 }}>&ldquo;{report.content}&rdquo;</p>
                <div style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)", lineHeight: 1.6 }}>
                  <span>Reported by: <strong>{report.reportedBy}</strong></span>
                  <span style={{ margin: "0 8px" }}>·</span>
                  <span>Against: <strong>{report.reportedUser}</strong></span>
                  <span style={{ margin: "0 8px" }}>·</span>
                  <span>In: <em>{report.courseContext}</em></span>
                  <span style={{ margin: "0 8px" }}>·</span>
                  <span>{new Date(report.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                <button className="btn btn-sm btn-ghost"><Eye size={13} /> View</button>
                <button className="btn btn-sm" style={{ background: "hsl(145 63% 40%)", color: "white", fontSize: "0.72rem" }}>
                  <CheckCircle size={13} /> Dismiss
                </button>
                <button className="btn btn-sm" style={{ background: "hsl(0 72% 51%)", color: "white", fontSize: "0.72rem" }}>
                  <Trash2 size={13} /> Remove Content
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resolved */}
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <CheckCircle size={16} style={{ color: "hsl(145 63% 40%)" }} />
        Resolved ({resolved.length})
      </h2>
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Content</th><th>Reason</th><th>Reported By</th><th>Course</th><th>Action Taken</th><th>Date</th></tr>
            </thead>
            <tbody>
              {resolved.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, fontSize: "0.85rem" }}>{r.content}</td>
                  <td><span className="badge badge-error" style={{ fontSize: "0.7rem" }}>{r.reason}</span></td>
                  <td>{r.reportedBy}</td>
                  <td style={{ fontSize: "0.82rem" }}>{r.courseContext}</td>
                  <td><span className="badge badge-success" style={{ fontSize: "0.7rem" }}>{(r as any).resolvedAction || "Resolved"}</span></td>
                  <td style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
