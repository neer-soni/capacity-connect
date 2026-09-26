"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { mockUsers, mockTrainerStats, mockCourses } from "@/lib/mock-data";
import { Star, Users, BookOpen, Award, CheckCircle, Edit, Mail, Building, Briefcase } from "lucide-react";

export default function TrainerProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(mockUsers.trainer);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

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

    // Fetch trainer courses
    fetch("/api/trainer/courses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          setCourses(mockCourses.slice(0, 3));
        }
      })
      .catch(() => {
        setCourses(mockCourses.slice(0, 3));
      });
  }, [session]);

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
              { label: "Students Taught", value: mockTrainerStats.totalStudents, icon: <Users size={16} /> },
              { label: "Avg Rating", value: mockTrainerStats.avgRating, icon: <Star size={16} fill="hsl(38 80% 40%)" /> },
              { label: "Active Courses", value: courses.length || 3, icon: <BookOpen size={16} /> },
              { label: "Certificates Issued", value: mockTrainerStats.certificatesIssued, icon: <Award size={16} /> },
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
            {(profile.skills && profile.skills.length > 0 ? profile.skills : mockUsers.trainer.skills).map((s: string) => (
              <span key={s} className="skill-pill" style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
                {s}
              </span>
            ))}
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
          {courses.map((c: any) => (
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
                  {c.department} · {c.enrolledCount || 0} enrolled · Rating: {c.rating || "5.0"} ★
                </div>
              </div>
              <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>
                Published
              </span>
            </div>
          ))}
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
