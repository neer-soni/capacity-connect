"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, BookOpen, Users, Award, TrendingUp, Star, Megaphone } from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/courses").then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d.slice(0, 4) : [])).catch(() => {});
    fetch("/api/announcements").then(r => r.json()).then(d => setAnnouncements(Array.isArray(d) ? d : [])).catch(() => setAnnouncements([]));
  }, []);

  const role = (session?.user as any)?.role;
  const dashLink = role === "admin" ? "/admin/dashboard" : role === "trainer" ? "/trainer/dashboard" : role === "trainee" ? "/trainee/dashboard" : "/login";

  return (
    <div style={{ minHeight: "100vh", background: "hsl(210 20% 98%)" }}>
      {/* Top bar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", height: 60, background: "white", borderBottom: "1px solid hsl(214 20% 90%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "linear-gradient(135deg, hsl(215 84% 30%), hsl(178 68% 35%))", borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "0.75rem" }}>CC</div>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "hsl(215 30% 12%)" }}>Capacity Connect</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/courses" className="btn btn-ghost btn-sm" style={{ fontSize: "0.82rem" }}>Courses</Link>
          {session?.user ? (
            <Link href={dashLink} className="btn btn-primary btn-sm" style={{ fontSize: "0.82rem" }}>Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline btn-sm" style={{ fontSize: "0.82rem" }}>Login</Link>
              <Link href="/signup" className="btn btn-primary btn-sm" style={{ fontSize: "0.82rem" }}>Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "64px 32px", textAlign: "center", background: "linear-gradient(180deg, white 0%, hsl(215 84% 97%) 100%)" }}>
        <div className="animate-fade-in" style={{ maxWidth: 680, margin: "0 auto" }}>
          <span className="badge badge-primary" style={{ fontSize: "0.75rem", marginBottom: 16 }}>Ministry of Earth Sciences</span>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 900, lineHeight: 1.15, marginBottom: 16, background: "linear-gradient(135deg, hsl(215 84% 25%), hsl(178 68% 30%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Build Capacity.<br />Connect Knowledge.
          </h1>
          <p style={{ fontSize: "1.1rem", color: "hsl(215 18% 38%)", lineHeight: 1.7, marginBottom: 32, maxWidth: 520, margin: "0 auto 32px" }}>
            India's premier digital learning platform for earth science professionals. Upskill, certify, and advance your career.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <Link href="/courses" className="btn btn-primary btn-lg">Browse Courses <ArrowRight size={18} /></Link>
            <Link href="/signup" className="btn btn-outline btn-lg">Join Now</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "40px 32px", background: "white" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {[
            { icon: <Users size={24} />, value: "500+", label: "Active Learners", color: "hsl(215 84% 30%)" },
            { icon: <BookOpen size={24} />, value: `${courses.length}+`, label: "Published Courses", color: "hsl(178 68% 35%)" },
            { icon: <Award size={24} />, value: "200+", label: "Certificates Issued", color: "hsl(38 80% 40%)" },
            { icon: <TrendingUp size={24} />, value: "85%", label: "Completion Rate", color: "hsl(145 63% 40%)" },
          ].map((s, i) => (
            <div key={i} className="animate-fade-in" style={{ textAlign: "center", animationDelay: `${i * 0.1}s` }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: `${s.color}12`, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>{s.icon}</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section style={{ padding: "56px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Featured Courses</h2>
              <p style={{ color: "hsl(215 16% 57%)", fontSize: "0.9rem" }}>Start your learning journey</p>
            </div>
            <Link href="/courses" className="btn btn-outline btn-sm">View All <ArrowRight size={14} /></Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
            {courses.map((c, i) => (
              <Link key={c.id} href={`/courses/${c.id}`} className="card card-hover animate-fade-in" style={{ textDecoration: "none", animationDelay: `${i * 0.08}s`, padding: "22px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>{c.thumbnail}</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <span className="badge badge-primary" style={{ fontSize: "0.68rem" }}>{c.level}</span>
                  <span className="badge badge-muted" style={{ fontSize: "0.68rem" }}>{c.department}</span>
                </div>
                <h3 style={{ fontSize: "0.92rem", fontWeight: 700, marginBottom: 6, color: "hsl(215 30% 12%)" }}>{c.title}</h3>
                <p style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)", lineHeight: 1.5, marginBottom: 12, flex: 1 }}>
                  {c.description?.slice(0, 90)}...
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "hsl(215 16% 57%)" }}>
                  <span>By {c.trainer}</span>
                  {c.rating > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Star size={12} fill="hsl(38 80% 40%)" style={{ color: "hsl(38 80% 40%)" }} /> {c.rating}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section style={{ padding: "48px 32px", background: "white" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><Megaphone size={22} /> Latest Updates</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {announcements.slice(0, 3).map((a: any) => (
                <div key={a.id} className="card" style={{ padding: "18px 22px", display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ fontSize: "1.8rem" }}>{a.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 3 }}>{a.title}</h3>
                    <p style={{ fontSize: "0.82rem", color: "hsl(215 18% 38%)" }}>{a.body}</p>
                  </div>
                  <span className={`badge ${a.type === "achievement" ? "badge-warning" : "badge-primary"}`} style={{ fontSize: "0.68rem" }}>{a.type}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ padding: "32px", textAlign: "center", borderTop: "1px solid hsl(214 20% 90%)", background: "white" }}>
        <p style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>
          © 2024 Capacity Connect · Ministry of Earth Sciences · Government of India
        </p>
      </footer>
    </div>
  );
}
