"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { BookOpen, Award, Bell, TrendingUp, PlayCircle, CheckCircle, ArrowRight } from "lucide-react";

export default function TraineeDashboard() {
  const { data: session } = useSession();
  const user = session?.user;
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [enrollRes, certRes, notifRes] = await Promise.all([
        fetch("/api/trainee/enrollments"),
        fetch("/api/trainee/certificates"),
        fetch("/api/notifications"),
      ]);
      const [enrollData, certData, notifData] = await Promise.all([
        enrollRes.json(),
        certRes.json(),
        notifRes.json(),
      ]);
      setEnrollments(Array.isArray(enrollData) ? enrollData : []);
      setCertificates(Array.isArray(certData) ? certData : []);
      setNotifications(Array.isArray(notifData) ? notifData : []);
      setLoading(false);
    }
    load();
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.read);
  const completedCount = enrollments.filter((e) => e.status === "completed").length;

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>
          Welcome back, {user?.name?.split(" ")[0] || "Trainee"}! 👋
        </h1>
        <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem" }}>
          {(user as any)?.department || "MoES"} · Trainee
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4-auto" style={{ marginBottom: 28 }}>
        {[
          { label: "Enrolled Courses", value: enrollments.length, icon: <BookOpen size={20} />, color: "hsl(215 84% 30%)", bg: "hsl(215 84% 96%)" },
          { label: "Completed", value: completedCount, icon: <CheckCircle size={20} />, color: "hsl(145 63% 40%)", bg: "hsl(145 63% 94%)" },
          { label: "Certificates", value: certificates.length, icon: <Award size={20} />, color: "hsl(38 80% 40%)", bg: "hsl(38 95% 94%)" },
          { label: "Unread Notifications", value: unreadNotifs.length, icon: <Bell size={20} />, color: "hsl(0 72% 51%)", bg: "hsl(0 72% 96%)" },
        ].map((s, i) => (
          <div key={i} className="card stat-card animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="stat-value">{loading ? "—" : s.value}</div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2fr-1fr">
        {/* My Courses */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>My Courses</h2>
            <Link href="/trainee/courses" className="btn btn-ghost btn-sm" style={{ fontSize: "0.8rem" }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="card" style={{ padding: 32, textAlign: "center", color: "hsl(215 16% 57%)" }}>Loading courses...</div>
          ) : enrollments.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: "center" }}>
              <BookOpen size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ color: "hsl(215 16% 57%)" }}>No courses yet.</p>
              <Link href="/courses" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Browse Courses</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {enrollments.map((e) => (
                <div key={e.courseId} className="card animate-fade-in" style={{ padding: "18px" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ fontSize: "2rem", flexShrink: 0 }}>{e.course.thumbnail}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{e.course.title}</span>
                        <span className={`badge ${e.status === "completed" ? "badge-success" : "badge-warning"}`} style={{ fontSize: "0.7rem" }}>
                          {e.status === "completed" ? "✓ Done" : "In Progress"}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)", marginBottom: 10 }}>
                        By {e.course.trainer} · {e.course.duration}
                      </p>
                      <div className="progress-bar" style={{ marginBottom: 6 }}>
                        <div className="progress-fill" style={{ width: `${e.progress}%` }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "hsl(215 16% 57%)" }}>
                        <span>{e.progress}% complete</span>
                        {e.status !== "completed" && (
                          <Link href={`/trainee/courses/${e.courseId}/learn`} style={{ color: "hsl(215 84% 30%)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                            <PlayCircle size={12} /> Continue
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="card" style={{ padding: "18px", height: "fit-content" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Bell size={17} style={{ color: "hsl(215 84% 30%)" }} />
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700 }}>Notifications</h3>
            {unreadNotifs.length > 0 && (
              <span className="badge badge-error" style={{ fontSize: "0.65rem" }}>{unreadNotifs.length} new</span>
            )}
          </div>
          {loading ? (
            <p style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>Loading...</p>
          ) : notifications.length === 0 ? (
            <p style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>No notifications yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} style={{ padding: "8px 10px", borderRadius: 8, background: n.read ? "transparent" : "hsl(215 84% 97%)", border: n.read ? "1px solid transparent" : "1px solid hsl(215 84% 88%)" }}>
                  <p style={{ fontSize: "0.78rem", color: "hsl(215 30% 12%)", lineHeight: 1.5 }}>{n.message}</p>
                  <p style={{ fontSize: "0.72rem", color: "hsl(215 16% 57%)", marginTop: 3 }}>
                    {new Date(n.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
