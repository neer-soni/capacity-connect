"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Star, Users, Clock, BookOpen, PlayCircle, FileText, Video, Presentation, MessageSquare, Award } from "lucide-react";

const typeIcons: Record<string, any> = { video: <Video size={16} />, pdf: <FileText size={16} />, slide: <Presentation size={16} /> };

export default function CourseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${id}`).then(r => r.json()).then(d => {
      if (d.error) setCourse(null);
      else setCourse(d);
      setLoading(false);
    }).catch(() => setLoading(false));

    if (session?.user) {
      fetch("/api/trainee/enrollments").then(r => r.json()).then(d => {
        if (Array.isArray(d)) setEnrolled(d.some((e: any) => e.courseId === id));
      }).catch(() => {});
    }
  }, [id, session]);

  const handleEnroll = async () => {
    setEnrolling(true);
    await fetch("/api/trainee/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: id }),
    });
    setEnrolled(true);
    setEnrolling(false);
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  if (!course) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Course not found</div>;

  return (
    <div style={{ minHeight: "100vh", background: "hsl(210 20% 98%)" }}>
      <nav style={{ display: "flex", alignItems: "center", padding: "0 32px", height: 60, background: "white", borderBottom: "1px solid hsl(214 20% 90%)", gap: 16 }}>
        <Link href="/courses" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Back</Link>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ background: "linear-gradient(135deg, hsl(215 84% 30%), hsl(178 68% 35%))", borderRadius: 7, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "0.6rem" }}>CC</div>
          <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "hsl(215 30% 12%)" }}>Capacity Connect</span>
        </Link>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px" }}>
        {/* Header */}
        <div className="card animate-fade-in" style={{ padding: "36px", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ fontSize: "4rem", flexShrink: 0 }}>{course.thumbnail}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <span className="badge badge-primary">{course.level}</span>
                <span className="badge badge-muted">{course.department}</span>
                <span className="badge badge-success">{course.status}</span>
              </div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 8 }}>{course.title}</h1>
              <p style={{ color: "hsl(215 18% 38%)", lineHeight: 1.7, marginBottom: 16 }}>{course.description}</p>
              <div style={{ display: "flex", gap: 18, fontSize: "0.85rem", color: "hsl(215 16% 57%)", marginBottom: 18 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> {course.duration}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={14} /> {course.totalLessons} lessons</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={14} /> {course.enrolledCount} enrolled</span>
                {course.rating > 0 && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Star size={14} fill="hsl(38 80% 40%)" style={{ color: "hsl(38 80% 40%)" }} /> {course.rating}</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderTop: "1px solid hsl(214 20% 92%)" }}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: "0.7rem" }}>{course.trainerAvatar}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{course.trainer} {course.trainerVerified && "✓"}</div>
                  <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>{course.trainerDept}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <div>
            {/* Resources */}
            <div className="card" style={{ padding: "24px", marginBottom: 20 }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>📚 Course Resources ({course.resources?.length || 0})</h2>
              {(course.resources || []).map((r: any) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid hsl(214 20% 94%)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "hsl(215 84% 96%)", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(215 84% 30%)" }}>
                    {typeIcons[r.type] || <FileText size={16} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{r.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>{r.type} · {r.duration || r.size}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Forum Preview */}
            {course.threads?.length > 0 && (
              <div className="card" style={{ padding: "24px" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>💬 Discussion Forum</h2>
                {course.threads.map((t: any) => (
                  <div key={t.id} style={{ padding: "10px 0", borderBottom: "1px solid hsl(214 20% 94%)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      {t.isQuestion && <span className="badge badge-warning" style={{ fontSize: "0.65rem" }}>Q</span>}
                      <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{t.title}</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>
                      By {t.author} · {t.replyCount} replies · ▲ {t.upvotes}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enroll CTA */}
          <div className="card" style={{ padding: "28px", height: "fit-content", position: "sticky", top: 80 }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 16 }}>Ready to Learn?</h3>
            {enrolled ? (
              <>
                <p style={{ fontSize: "0.85rem", color: "hsl(145 63% 35%)", fontWeight: 600, marginBottom: 14 }}>✓ You're enrolled!</p>
                <Link href={`/trainee/courses/${id}/learn`} className="btn btn-primary" style={{ width: "100%" }}>
                  <PlayCircle size={16} /> Go to Course
                </Link>
              </>
            ) : session?.user ? (
              <button onClick={handleEnroll} disabled={enrolling} className="btn btn-primary" style={{ width: "100%" }}>
                {enrolling ? "Enrolling..." : "Enroll Now — Free"}
              </button>
            ) : (
              <Link href="/login" className="btn btn-primary" style={{ width: "100%" }}>Login to Enroll</Link>
            )}
            <div style={{ marginTop: 16, fontSize: "0.8rem", color: "hsl(215 16% 57%)", lineHeight: 1.8 }}>
              <p>✓ {course.totalLessons} lessons · {course.duration}</p>
              <p>✓ Certificate on completion</p>
              <p>✓ Forum access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
