"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { mockUsers, mockCourses, mockEnrollments, mockCertificates, mockSkillGaps } from "@/lib/mock-data";
import Link from "next/link";
import { Edit, Award, BookOpen, TrendingUp, CheckCircle, XCircle, ExternalLink, Mail, Building, Briefcase } from "lucide-react";

export default function TraineeProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(mockUsers.trainee);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
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
        // Fallback to session or mock
        if (session?.user) {
          setProfile((prev: any) => ({
            ...prev,
            name: session.user.name || prev.name,
            email: session.user.email || prev.email,
            department: (session.user as any).department || prev.department,
            avatar: (session.user as any).avatar || prev.avatar,
          }));
        }
        setLoading(false);
      });
  }, [session]);

  const completedCourses = mockEnrollments
    .filter((e) => e.status === "completed")
    .map((e) => mockCourses.find((c) => c.id === e.courseId)!)
    .filter(Boolean);

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
              { label: "Courses Enrolled", value: mockEnrollments.length },
              { label: "Courses Completed", value: completedCourses.length },
              { label: "Certificates Earned", value: mockCertificates.length },
              { label: "Skills Verified", value: (profile.skills || []).length || 4 },
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
              {(profile.skills && profile.skills.length > 0 ? profile.skills : mockUsers.trainee.skills).map((s: string) => (
                <span key={s} className="skill-pill">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Portfolio & Skill Gap */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Skill Gap Tracker */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <TrendingUp size={18} style={{ color: "hsl(215 84% 30%)" }} />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>Skill Gap Tracker</h2>
              <span className="badge badge-error" style={{ fontSize: "0.7rem", marginLeft: "auto" }}>
                {mockSkillGaps.filter((s) => !s.hasIt && s.required).length} Required Gaps
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mockSkillGaps.map((s) => (
                <div
                  key={s.skill}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: s.hasIt ? "hsl(145 63% 97%)" : "transparent",
                  }}
                >
                  {s.hasIt ? (
                    <CheckCircle size={18} style={{ color: "hsl(145 63% 40%)", flexShrink: 0 }} />
                  ) : (
                    <XCircle size={18} style={{ color: s.required ? "hsl(0 72% 51%)" : "hsl(215 16% 65%)", flexShrink: 0 }} />
                  )}
                  <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: s.required ? 600 : 400 }}>
                    {s.skill}
                    {s.required && (
                      <span className="badge badge-error" style={{ marginLeft: 6, fontSize: "0.65rem" }}>
                        Required
                      </span>
                    )}
                  </span>
                  {!s.hasIt && s.courses.length > 0 && (
                    <Link
                      href={`/courses/${s.courses[0]}`}
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: "0.72rem" }}
                    >
                      Suggested Course →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio: Completed */}
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
                    <div style={{ fontSize: "1.6rem" }}>{c.thumbnail}</div>
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
            {mockCertificates.map((cert) => (
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
                  <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>{cert.courseTitle}</div>
                  <div style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)" }}>
                    Issued: {new Date(cert.issuedAt).toLocaleDateString("en-IN")} · ID: {cert.hash}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <span className="badge badge-success" style={{ fontSize: "0.68rem" }}>
                    ✓ Admin Validated
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
            ))}
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
