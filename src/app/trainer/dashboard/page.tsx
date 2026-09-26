"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, BookOpen, Award, Star, TrendingUp } from "lucide-react";

export default function TrainerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trainer/stats").then(r => r.json()).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <DashboardLayout><div style={{ textAlign: "center", padding: 60, color: "hsl(215 16% 57%)" }}>Loading dashboard...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>Trainer Dashboard 👩‍🏫</h1>
        <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem" }}>{session?.user?.name} · Analytics & Insights</p>
      </div>

      {/* Stats */}
      <div className="grid-4-auto" style={{ marginBottom: 28 }}>
        {[
          { label: "Total Students", value: stats.totalStudents, icon: <Users size={20} />, color: "hsl(215 84% 30%)", bg: "hsl(215 84% 96%)" },
          { label: "Active Courses", value: stats.totalCourses, icon: <BookOpen size={20} />, color: "hsl(178 68% 35%)", bg: "hsl(178 68% 92%)" },
          { label: "Avg Rating", value: stats.avgRating || "—", icon: <Star size={20} />, color: "hsl(38 80% 40%)", bg: "hsl(38 95% 94%)" },
          { label: "Certificates Issued", value: stats.certificatesIssued, icon: <Award size={20} />, color: "hsl(145 63% 40%)", bg: "hsl(145 63% 92%)" },
        ].map((s, i) => (
          <div key={i} className="card stat-card animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="stat-value">{s.value}</div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2-auto" style={{ marginBottom: 24 }}>
        {/* Weekly engagement */}
        <div className="card" style={{ padding: "22px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 18 }}>📈 Weekly Engagement</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.weeklyEngagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: "0.82rem" }} />
              <Bar dataKey="views" fill="hsl(215, 84%, 30%)" radius={[4, 4, 0, 0]} name="Views" />
              <Bar dataKey="completions" fill="hsl(178, 68%, 35%)" radius={[4, 4, 0, 0]} name="Completions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quiz scores */}
        <div className="card" style={{ padding: "22px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 18 }}>📊 Quiz Score Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.quizScoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: "0.82rem" }} />
              <Bar dataKey="count" fill="hsl(38, 95%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drop-off */}
      <div className="card" style={{ padding: "22px" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 18 }}>📉 Learner Retention by Lesson</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={stats.dropOffRates}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" />
            <XAxis dataKey="lesson" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: "0.82rem" }} />
            <Line type="monotone" dataKey="retention" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardLayout>
  );
}
