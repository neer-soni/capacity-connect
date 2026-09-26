"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, BookOpen, Award, TrendingUp, AlertTriangle, CheckCircle, Clock, ShieldCheck } from "lucide-react";

const COLORS = ["hsl(215, 84%, 30%)", "hsl(178, 68%, 35%)", "hsl(38, 95%, 55%)", "hsl(0, 72%, 51%)", "hsl(145, 63%, 40%)"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: 60, color: "hsl(215 16% 57%)" }}>Loading dashboard data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>Platform Dashboard 🛡️</h1>
        <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem" }}>Admin overview · Capacity Connect</p>
      </div>

      {/* Stats */}
      <div className="grid-4-auto" style={{ marginBottom: 28 }}>
        {[
          { label: "Total Users", value: stats.totalUsers, icon: <Users size={20} />, color: "hsl(215 84% 30%)", bg: "hsl(215 84% 96%)", sub: `${stats.pendingApprovals} pending` },
          { label: "Published Courses", value: stats.publishedCourses, icon: <BookOpen size={20} />, color: "hsl(178 68% 35%)", bg: "hsl(178 68% 92%)", sub: `${stats.pendingCourses} pending review` },
          { label: "Certificates Issued", value: stats.totalCertificates, icon: <Award size={20} />, color: "hsl(38 80% 40%)", bg: "hsl(38 95% 94%)", sub: `${stats.pendingCertValidation} pending validation` },
          { label: "Completion Rate", value: `${stats.completionRate}%`, icon: <TrendingUp size={20} />, color: "hsl(145 63% 40%)", bg: "hsl(145 63% 92%)", sub: `${stats.totalEnrollments} total enrollments` },
        ].map((s, i) => (
          <div key={i} className="card stat-card animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="stat-value">{s.value}</div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            </div>
            <div className="stat-label">{s.label}</div>
            <div style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid-4-auto" style={{ gap: 12, marginBottom: 28 }}>
        {[
          { label: "Pending Users", count: stats.pendingApprovals, icon: <AlertTriangle size={16} />, color: "hsl(38 80% 40%)", href: "/admin/users" },
          { label: "Course Review", count: stats.pendingCourses, icon: <Clock size={16} />, color: "hsl(215 84% 30%)", href: "/admin/courses" },
          { label: "Cert Validation", count: stats.pendingCertValidation, icon: <CheckCircle size={16} />, color: "hsl(145 63% 40%)", href: "/admin/certificates" },
          { label: "Moderation", count: 1, icon: <ShieldCheck size={16} />, color: "hsl(0 72% 51%)", href: "/admin/reports" },
        ].map((a) => (
          <a key={a.label} href={a.href} className="card card-hover" style={{ padding: "14px 18px", textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${a.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: a.color }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "hsl(215 30% 12%)" }}>{a.label}</div>
              <div style={{ fontSize: "0.78rem", color: a.color, fontWeight: 700 }}>{a.count} pending</div>
            </div>
          </a>
        ))}
      </div>

      <div className="grid-2-auto" style={{ marginBottom: 24 }}>
        {/* Monthly enrollments */}
        <div className="card" style={{ padding: "22px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 18 }}>📈 Monthly Enrollments</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.monthlyEnrollments}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214 20% 90%)", fontSize: "0.82rem" }} />
              <Bar dataKey="count" fill="hsl(215, 84%, 30%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dept completion */}
        <div className="card" style={{ padding: "22px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 18 }}>🏢 Completion Rate by Department</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.courseCompletionByDept} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
              <YAxis dataKey="dept" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214 20% 90%)", fontSize: "0.82rem" }} />
              <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                {(stats.courseCompletionByDept || []).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Courses */}
      <div className="card" style={{ padding: "22px" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 14 }}>🏆 Top Courses by Enrollment</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(stats.topCourses || []).map((c: any, i: number) => (
            <div key={c.title} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${COLORS[i]}20`, color: COLORS[i], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.78rem" }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, fontSize: "0.875rem", fontWeight: 600 }}>{c.title}</div>
              <div className="progress-bar" style={{ flex: 1, maxWidth: 200 }}>
                <div className="progress-fill" style={{ width: `${Math.min(100, (c.enrollments / 10) * 100)}%` }} />
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(215 84% 30%)", minWidth: 80, textAlign: "right" }}>
                {c.enrollments} enrolled
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
