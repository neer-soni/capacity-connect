"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EditProfileModal from "@/components/profile/EditProfileModal";
import Link from "next/link";
import { Edit, Award, BookOpen, TrendingUp, CheckCircle, XCircle, ExternalLink, Mail, Loader2 } from "lucide-react";

interface EnrollmentData {
  id: string;
  courseId: string;
  progress: number;
  status: string;
  course: {
    id: string;
    title: string;
    trainer: string;
    thumbnail: string;
    department: string;
  };
}

interface CertificateData {
  id: string;
  hash: string;
  issuedAt: string;
  course: {
    title: string;
    department: string;
  };
}

export default function TraineeProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);

  useEffect(() => {
    // Fetch profile
    fetch("/api/profile")
      .then((r) => {
        if (!r.ok) throw new Error("Not loaded");
        return r.json();
      })
      .then((data) => {
        if (data && data.name) {
          setProfile(data);
        }
        setLoading(false);
      })
      .catch(() => {
        if (session?.user) {
          setProfile({
            name: session.user.name || "Trainee",
            email: session.user.email || "",
            department: (session.user as any).department || "",
            designation: (session.user as any).designation || "",
            avatar: (session.user as any).avatar || "",
            skills: [],
            role: "trainee",
          });
        }
        setLoading(false);
      });

    // Fetch enrollments
    fetch("/api/trainee/enrollments")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEnrollments(data);
      })
      .catch(() => {});

    // Fetch certificates
    fetch("/api/trainee/certificates")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCertificates(data);
      })
      .catch(() => {});
  }, [session]);

  const completedCourses = enrollments
    .filter((e) => e.status === "completed")
    .map((e) => e.course)
    .filter(Boolean);

  // Build skill gap from profile skills vs enrolled course topics
  const userSkills = (profile?.skills || []).map((s: string) => s.toLowerCase());

  if (loading || !profile) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Loader2 size={32} className="spinner" style={{ color: "hsl(215 84% 52%)" }} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid-2fr-1fr" style={{ alignItems: "start" }}>
        {/* Left: Profile card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: "28px 24px", textAlign: "center" }}>
            <div
              className="avatar"
              style={{
                width: 76,
                height: 76,
                fontSize: "1.4rem",
                margin: "0 auto 14px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {profile.avatar || profile.name?.slice(0, 2).toUpperCase() || "PS"}
            </div>

            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 4, color: "hsl(215 30% 12%)" }}>
              {profile.name}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "hsl(215 16% 57%)", marginBottom: 6 }}>
              {profile.designation || "Scientific Trainee"}
            </p>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <span className="badge badge-primary" style={{ fontSize: "0.72rem" }}>
                {profile.department || "MoES Institute"}
              </span>
              <span className="badge badge-secondary" style={{ fontSize: "0.72rem" }}>
                Trainee
              </span>
            </div>

            <div style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Mail size={13} /> {profile.email}
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-outline btn-sm"
              style={{ width: "100%", justifyContent: "center", gap: 8 }}
            >
              <Edit size={14} /> Edit Profile & Skills
            </button>
          </div>

          {/* Stats */}
          <div className="card" style={{ padding: "20px" }}>
            <h3
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "hsl(215 18% 38%)",
              }}
            >
              Learning Progress Stats
            </h3>
            {[
              { label: "Courses Enrolled", value: enrollments.length },
              { label: "Courses Completed", value: completedCourses.length },
              { label: "Certificates Earned", value: certificates.length },
              { label: "Skills Listed", value: (profile.skills || []).length },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid hsl(214 20% 92%)",
                  fontSize: "0.85rem",
                }}
              >
                <span style={{ color: "hsl(215 16% 57%)" }}>{s.label}</span>
                <span style={{ fontWeight: 700, color: "hsl(215 84% 30%)" }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "hsl(215 18% 38%)",
                }}
              >
                My Competencies
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                style={{ background: "transparent", border: "none", color: "hsl(215 84% 30%)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
              >
                + Add
              </button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((s: string) => (
                  <span key={s} className="skill-pill">
                    {s}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: "0.85rem", color: "hsl(215 16% 57%)", fontStyle: "italic" }}>
                  No skills added yet — click + Add to list your competencies.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Portfolio & Certificates */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Learning Portfolio: Completed courses */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <BookOpen size={18} style={{ color: "hsl(215 84% 30%)" }} />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>Learning Portfolio</h2>
            </div>
            {completedCourses.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px" }}>
                <p style={{ fontSize: "0.85rem" }}>Complete your first course to build your portfolio!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {completedCourses.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      padding: "12px 14px",
                      background: "hsl(145 63% 96%)",
                      borderRadius: 10,
                      border: "1px solid hsl(145 63% 88%)",
                    }}
                  >
                    <div style={{ fontSize: "1.6rem" }}>{c.thumbnail || "📘"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>{c.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)" }}>
                        By {c.trainer} · {c.department}
                      </div>
                    </div>
                    <CheckCircle size={18} style={{ color: "hsl(145 63% 40%)" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certificates */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <Award size={18} style={{ color: "hsl(38 80% 40%)" }} />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>Issued Certificates</h2>
              <Link href="/trainee/certificates" style={{ marginLeft: "auto", fontSize: "0.8rem", color: "hsl(215 84% 30%)", fontWeight: 600 }}>
                View All →
              </Link>
            </div>
            {certificates.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px" }}>
                <p style={{ fontSize: "0.85rem" }}>No certificates earned yet. Complete a course to get certified!</p>
              </div>
            ) : (
              certificates.map((cert) => (
                <div
                  key={cert.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: "14px 16px",
                    background: "hsl(38 95% 96%)",
                    borderRadius: 10,
                    border: "1px solid hsl(38 95% 88%)",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ fontSize: "1.8rem" }}>🏆</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>{cert.course?.title || "Course"}</div>
                    <div style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)" }}>
                      Issued: {new Date(cert.issuedAt).toLocaleDateString("en-IN")} · ID: {cert.hash?.slice(0, 12) || "—"}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                    <span className="badge badge-success" style={{ fontSize: "0.68rem" }}>
                      ✓ Validated
                    </span>
                    <Link
                      href="/trainee/certificates"
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: "0.72rem" }}
                    >
                      <ExternalLink size={12} /> View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={{
          name: profile.name,
          email: profile.email,
          department: profile.department,
          designation: profile.designation,
          avatar: profile.avatar,
          skills: profile.skills,
          role: "trainee",
        }}
        onProfileUpdated={(updated) => {
          setProfile((prev: any) => ({ ...prev, ...updated }));
        }}
      />
    </DashboardLayout>
  );
}
