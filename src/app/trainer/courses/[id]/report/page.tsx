"use client";
import { use, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { ArrowLeft, Download, Search, Users, CheckCircle, Award } from "lucide-react";

export default function TrainerCourseReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/trainer/courses/${id}/report`)
      .then(r => r.json())
      .then(d => {
        setReport(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <DashboardLayout><div style={{ padding: 60, textAlign: "center", color: "hsl(215 16% 57%)" }}>Loading report...</div></DashboardLayout>;
  }

  if (report?.error || !report) {
    return <DashboardLayout><div style={{ padding: 60, textAlign: "center", color: "hsl(0 72% 51%)" }}>Error loading report.</div></DashboardLayout>;
  }

  const trainees = report.trainees.filter((t: any) => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href={`/trainer/courses/${id}`} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Trainee Progress Report</h1>
          <p style={{ fontSize: "0.9rem", color: "hsl(215 16% 57%)" }}>{report.course.title}</p>
        </div>
        <button className="btn btn-outline btn-sm">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid-4-auto" style={{ marginBottom: 28 }}>
        {[
          { label: "Enrolled", value: report.summary.totalEnrolled, icon: <Users size={18} />, color: "hsl(215 84% 30%)", bg: "hsl(215 84% 96%)" },
          { label: "Course Completed", value: report.summary.completed, icon: <CheckCircle size={18} />, color: "hsl(145 63% 40%)", bg: "hsl(145 63% 94%)" },
          { label: "Quiz Avg Score", value: `${report.summary.avgScore}%`, icon: <CheckCircle size={18} />, color: "hsl(178 68% 35%)", bg: "hsl(178 68% 92%)" },
          { label: "Quizzes Passed", value: report.summary.passed, icon: <Award size={18} />, color: "hsl(38 80% 40%)", bg: "hsl(38 95% 94%)" },
        ].map((s, i) => (
          <div key={i} className="card stat-card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="stat-value" style={{ fontSize: "1.5rem" }}>{s.value}</div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            </div>
            <div className="stat-label" style={{ fontSize: "0.8rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Trainee Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(214 20% 92%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Enrolled Trainees</h2>
          <div className="search-bar" style={{ width: 250 }}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search trainees..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontSize: "0.85rem" }}
            />
          </div>
        </div>
        
        <div className="table-container">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "hsl(210 20% 98%)", borderBottom: "1px solid hsl(214 20% 92%)", textAlign: "left", fontSize: "0.75rem", textTransform: "uppercase", color: "hsl(215 16% 57%)", letterSpacing: "0.5px" }}>
                <th style={{ padding: "12px 20px", fontWeight: 700 }}>Trainee</th>
                <th style={{ padding: "12px 20px", fontWeight: 700 }}>Progress</th>
                <th style={{ padding: "12px 20px", fontWeight: 700 }}>Quiz Score</th>
                <th style={{ padding: "12px 20px", fontWeight: 700 }}>Certificate</th>
              </tr>
            </thead>
            <tbody>
              {trainees.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 40, textAlign: "center", color: "hsl(215 16% 57%)" }}>
                    No trainees found.
                  </td>
                </tr>
              ) : (
                trainees.map((t: any) => (
                  <tr key={t.userId} style={{ borderBottom: "1px solid hsl(214 20% 92%)" }}>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "hsl(215 84% 96%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "hsl(215 84% 30%)" }}>
                          {t.avatar || t.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{t.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="progress-bar" style={{ width: 100, marginBottom: 0 }}>
                          <div className={`progress-fill ${t.progress === 100 ? "completed" : ""}`} style={{ width: `${t.progress}%`, background: t.progress === 100 ? "hsl(145 63% 40%)" : undefined }} />
                        </div>
                        <span style={{ fontSize: "0.8rem", fontWeight: t.progress === 100 ? 700 : 500, color: t.progress === 100 ? "hsl(145 63% 40%)" : "inherit" }}>{t.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", fontWeight: 600 }}>
                      {t.quizScore === "Not attempted" ? (
                        <span style={{ color: "hsl(215 16% 57%)", fontSize: "0.8rem", fontWeight: 400 }}>Not attempted</span>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ color: parseInt(t.quizScore) >= 60 ? "hsl(145 63% 40%)" : "hsl(0 72% 51%)" }}>{t.quizScore}</span>
                          <span style={{ fontSize: "0.7rem", color: "hsl(215 16% 57%)", fontWeight: 400 }}>{t.quizRaw}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {t.certificateStatus === "Validated" ? (
                        <span className="badge badge-success">✓ Validated</span>
                      ) : t.certificateStatus === "Pending" ? (
                        <span className="badge badge-warning">⏳ Pending</span>
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
