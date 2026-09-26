"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BookOpen, PlayCircle, Star, Search, Clock, Users } from "lucide-react";

export default function TraineeCoursesPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/trainee/enrollments").then(r => r.json()),
      fetch("/api/courses").then(r => r.json()),
    ]).then(([enr, courses]) => {
      setEnrollments(Array.isArray(enr) ? enr : []);
      setAllCourses(Array.isArray(courses) ? courses : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const enrolledIds = new Set(enrollments.map(e => e.courseId));
  const discoverCourses = allCourses.filter(c => !enrolledIds.has(c.id));

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 24 }}>My Courses</h1>

      {loading ? (
        <div className="card" style={{ padding: 48, textAlign: "center", color: "hsl(215 16% 57%)" }}>Loading...</div>
      ) : (
        <>
          {/* Enrolled */}
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Enrolled ({enrollments.length})</h2>
          {enrollments.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: "center", marginBottom: 32 }}>
              <p style={{ color: "hsl(215 16% 57%)" }}>No courses enrolled yet.</p>
              <Link href="/courses" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Browse Catalog</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 36 }}>
              {enrollments.map((e, i) => (
                <div key={e.courseId} className="card card-hover animate-fade-in" style={{ padding: "22px", animationDelay: `${i * 0.05}s` }}>
                  <div style={{ fontSize: "2rem", marginBottom: 12 }}>{e.course.thumbnail}</div>
                  <span className={`badge ${e.status === "completed" ? "badge-success" : "badge-warning"}`} style={{ fontSize: "0.68rem", marginBottom: 8 }}>
                    {e.status === "completed" ? "✓ Completed" : `${e.progress}% progress`}
                  </span>
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 6 }}>{e.course.title}</h3>
                  <p style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)", marginBottom: 12 }}>By {e.course.trainer} · {e.course.duration}</p>
                  <div className="progress-bar" style={{ marginBottom: 12 }}>
                    <div className="progress-fill" style={{ width: `${e.progress}%` }} />
                  </div>
                  <Link href={`/trainee/courses/${e.courseId}/learn`} className="btn btn-primary btn-sm" style={{ width: "100%" }}>
                    <PlayCircle size={14} /> {e.status === "completed" ? "Review" : "Continue"}
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Discover */}
          {discoverCourses.length > 0 && (
            <>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Discover More</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {discoverCourses.map((c, i) => (
                  <Link key={c.id} href={`/courses/${c.id}`} className="card card-hover animate-fade-in" style={{ padding: "22px", textDecoration: "none", animationDelay: `${i * 0.05}s` }}>
                    <div style={{ fontSize: "2rem", marginBottom: 12 }}>{c.thumbnail}</div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <span className="badge badge-primary" style={{ fontSize: "0.68rem" }}>{c.level}</span>
                    </div>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 6, color: "hsl(215 30% 12%)" }}>{c.title}</h3>
                    <p style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)", marginBottom: 10 }}>By {c.trainer} · {c.duration}</p>
                    <div style={{ display: "flex", gap: 10, fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Users size={12} /> {c.enrolledCount}</span>
                      {c.rating > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Star size={12} fill="hsl(38 80% 40%)" style={{ color: "hsl(38 80% 40%)" }} /> {c.rating}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
