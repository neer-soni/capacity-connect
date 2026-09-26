"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { Star, Users, BookOpen, Award, Edit, Mail, Loader2 } from "lucide-react";

interface TrainerStats {
  totalStudents: number;
  avgRating: number;
  totalCourses: number;
  certificatesIssued: number;
}

export default function TrainerProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<TrainerStats>({
    totalStudents: 0,
    avgRating: 0,
    totalCourses: 0,
    certificatesIssued: 0,
  });

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
        // Use session data as fallback (no mock)
        if (session?.user) {
          setProfile({
            name: session.user.name || "Trainer",
            email: session.user.email || "",
            department: (session.user as any).department || "",
            designation: (session.user as any).designation || "",
            avatar: (session.user as any).avatar || "",
            skills: [],
            role: "trainer",
          });
        }
        setLoading(false);
      });

    // Fetch trainer courses
    fetch("/api/trainer/courses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data);
        }
      })
      .catch(() => {});

    // Fetch trainer stats
    fetch("/api/trainer/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setStats({
            totalStudents: data.totalStudents || 0,
            avgRating: data.avgRating || 0,
            totalCourses: data.totalCourses || 0,
            certificatesIssued: data.certificatesIssued || 0,
          });
        }
      })
      .catch(() => {});
  }, [session]);

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
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        {/* Profile header */}
        <div className="card" style={{ padding: "36px 32px", textAlign: "center", marginBottom: 24 }}>
          <div
            className="avatar"
            style={{
              width: 84,
              height: 84,
              fontSize: "1.6rem",
              margin: "0 auto 16px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
            }}
          >
            {profile.avatar || profile.name?.slice(0, 2).toUpperCase() || "TR"}
          </div>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4, color: "hsl(215 30% 12%)" }}>
            {profile.name}
          </h1>

          <p style={{ color: "hsl(215 16% 57%)", fontSize: "0.9rem", marginBottom: 6 }}>
            {profile.designation || "Faculty / Scientist"} · {profile.department || "MoES Institute"}
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            <span className="badge badge-secondary" style={{ fontSize: "0.75rem" }}>
              ✓ Verified MoES Trainer
            </span>
            <span style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)", display: "flex", alignItems: "center", gap: 4 }}>
              <Mail size={13} /> {profile.email}
            </span>
          </div>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 36,
              marginTop: 18,
              paddingTop: 18,
              borderTop: "1px solid hsl(214 20% 92%)",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Students Taught", value: stats.totalStudents, icon: <Users size={16} /> },
              { label: "Avg Rating", value: stats.avgRating || "—", icon: <Star size={16} fill="hsl(38 80% 40%)" /> },
              { label: "Active Courses", value: courses.length, icon: <BookOpen size={16} /> },
              { label: "Certificates Issued", value: stats.certificatesIssued, icon: <Award size={16} /> },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "hsl(215 84% 30%)", marginBottom: 2 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)", display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  {s.icon} {s.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: "8px 20px", gap: 8 }}
            >
              <Edit size={15} /> Edit Trainer Profile
            </button>
          </div>
        </div>

        {/* Expertise / Skills */}
        <div className="card" style={{ padding: "24px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "hsl(215 30% 12%)" }}>
              Scientific Expertise & Teaching Fields
            </h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              style={{ background: "transparent", border: "none", color: "hsl(215 84% 30%)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
            >
              Manage
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.map((s: string) => (
                <span key={s} className="skill-pill" style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
                  {s}
                </span>
              ))
            ) : (
              <span style={{ fontSize: "0.85rem", color: "hsl(215 16% 57%)", fontStyle: "italic" }}>
                No skills added yet — click Manage to add your expertise.
              </span>
            )}
          </div>
        </div>

        {/* Courses */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "hsl(215 30% 12%)" }}>
              Authored & Published Courses
            </h3>
            <span style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>
              {courses.length} course{courses.length !== 1 ? "s" : ""}
            </span>
          </div>
          {courses.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "hsl(215 16% 57%)", fontSize: "0.85rem" }}>
              No courses published yet.
            </div>
          ) : (
            courses.map((c: any) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  padding: "14px 16px",
                  background: "hsl(210 20% 98%)",
                  borderRadius: 10,
                  border: "1px solid hsl(214 20% 90%)",
                  marginBottom: 10,
                }}
              >
                <div style={{ fontSize: "1.8rem" }}>{c.thumbnail || "📘"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "hsl(215 30% 12%)" }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)", marginTop: 2 }}>
                    {c.department} · {c.enrolledCount || c._count?.enrollments || 0} enrolled
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>
                  Published
                </span>
              </div>
            ))
          )}
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
          role: "trainer",
        }}
        onProfileUpdated={(updated) => {
          setProfile((prev: any) => ({ ...prev, ...updated }));
        }}
      />
    </DashboardLayout>
  );
}
