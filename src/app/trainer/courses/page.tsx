"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, BookOpen, Users, Star, BarChart2 } from "lucide-react";

export default function TrainerCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trainer/courses").then(r => r.json()).then(d => {
      setCourses(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>My Courses</h1>
          <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem" }}>{courses.length} courses created</p>
        </div>
        <Link href="/trainer/courses/new" className="btn btn-primary"><Plus size={16} /> Create Course</Link>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 48, textAlign: "center", color: "hsl(215 16% 57%)" }}>Loading...</div>
      ) : courses.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: "center" }}>
          <BookOpen size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No courses yet</h3>
          <Link href="/trainer/courses/new" className="btn btn-primary btn-sm">Create Your First Course</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
          {courses.map((c, i) => (
            <div key={c.id} className="card card-hover animate-fade-in" style={{ padding: "24px", animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ fontSize: "2.5rem", flexShrink: 0 }}>{c.thumbnail}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <span className={`badge ${c.status === "published" ? "badge-success" : c.status === "draft" ? "badge-warning" : "badge-muted"}`} style={{ fontSize: "0.68rem" }}>
                      {c.status}
                    </span>
                    <span className="badge badge-primary" style={{ fontSize: "0.68rem" }}>{c.level}</span>
                  </div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 6 }}>{c.title}</h3>
                  <div style={{ display: "flex", gap: 14, fontSize: "0.78rem", color: "hsl(215 16% 57%)", marginBottom: 14 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Users size={13} /> {c.enrolledCount} students</span>
                    {c.rating > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Star size={13} fill="hsl(38 80% 40%)" style={{ color: "hsl(38 80% 40%)" }} /> {c.rating}</span>}
                    <span>{c.totalLessons} lessons · {c.duration}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-outline btn-sm" style={{ fontSize: "0.78rem" }}><BarChart2 size={13} /> Analytics</button>
                    <Link href={`/trainer/courses/${c.id}`} className="btn btn-primary btn-sm" style={{ fontSize: "0.78rem" }}>Manage</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
