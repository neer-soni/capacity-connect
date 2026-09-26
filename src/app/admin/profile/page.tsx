"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { ShieldCheck, Edit, Mail, Key, Shield, CheckCircle, Database, Lock, UserCheck, Calendar } from "lucide-react";
import Link from "next/link";

export default function AdminProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>({
    name: "Dr. Anil Gupta",
    email: "admin@moes.gov.in",
    department: "MoES HQ",
    designation: "Chief Platform Administrator",
    avatar: "AG",
    role: "admin",
    status: "approved",
    skills: ["System Administration", "Capacity Governance", "Course Moderation", "Information Security"],
  });
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

  return (
    <DashboardLayout role="admin">
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: "36px 32px", textAlign: "center", marginBottom: 24 }}>
          <div
            className="avatar"
            style={{
              width: 88,
              height: 88,
              fontSize: "1.7rem",
              margin: "0 auto 16px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
              background: "linear-gradient(135deg, hsl(215 84% 28%), hsl(0 72% 45%))",
            }}
          >
            {profile.avatar || profile.name?.slice(0, 2).toUpperCase() || "AG"}
          </div>

          <h1 style={{ fontSize: "1.55rem", fontWeight: 800, marginBottom: 4, color: "hsl(215 30% 12%)" }}>
            {profile.name}
          </h1>

          <p style={{ color: "hsl(215 16% 57%)", fontSize: "0.92rem", marginBottom: 8 }}>
            {profile.designation || "Chief Platform Administrator"} · {profile.department || "MoES Headquarters"}
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
            <span className="badge badge-error" style={{ fontSize: "0.75rem", padding: "3px 10px", gap: 4 }}>
              <ShieldCheck size={14} /> Super Administrator
            </span>
            <span className="badge badge-success" style={{ fontSize: "0.75rem", padding: "3px 10px" }}>
              Active
            </span>
          </div>

          <div style={{ fontSize: "0.85rem", color: "hsl(215 16% 57%)", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Mail size={14} /> {profile.email}
          </div>

          <div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: "8px 24px", gap: 8 }}
            >
              <Edit size={16} /> Edit Admin Profile & Password
            </button>
          </div>
        </div>

        {/* Security & Access Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          {/* Permissions Overview */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Shield size={18} style={{ color: "hsl(0 72% 51%)" }} />
              <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Governance Authority</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { title: "User Management", desc: "Approve trainers, manage account permissions", path: "/admin/users" },
                { title: "Course Validation", desc: "Review syllabus quality, approve publish requests", path: "/admin/courses" },
                { title: "Certificate Registry", desc: "Validate certificates, cryptographic audit trail", path: "/admin/certificates" },
                { title: "Content Moderation", desc: "Moderate forum topics and reported materials", path: "/admin/reports" },
              ].map((item) => (
                <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid hsl(214 20% 92%)" }}>
                  <CheckCircle size={16} style={{ color: "hsl(145 63% 40%)", marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <Link href={item.path} style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(215 84% 30%)", textDecoration: "none" }}>
                      {item.title}
                    </Link>
                    <p style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)", marginTop: 2 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Security Card */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Lock size={18} style={{ color: "hsl(215 84% 30%)" }} />
              <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Security & Credentials</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: "12px 14px", background: "hsl(210 20% 98%)", borderRadius: 8, border: "1px solid hsl(214 20% 90%)" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "hsl(215 30% 12%)" }}>
                  Password Protection
                </div>
                <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)", marginTop: 2 }}>
                  Encrypted using bcrypt salt hashing algorithm.
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: 8, fontSize: "0.75rem", padding: "4px 10px", gap: 4 }}
                >
                  <Key size={13} /> Change Admin Password
                </button>
              </div>

              <div style={{ padding: "12px 14px", background: "hsl(210 20% 98%)", borderRadius: 8, border: "1px solid hsl(214 20% 90%)" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "hsl(215 30% 12%)" }}>
                  Session Policy
                </div>
                <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)", marginTop: 2 }}>
                  JWT token session with 24-hour expiration timeout.
                </div>
              </div>

              <div style={{ padding: "12px 14px", background: "hsl(145 63% 97%)", borderRadius: 8, border: "1px solid hsl(145 63% 88%)" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "hsl(145 63% 30%)", display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle size={14} /> Identity Verified
                </div>
                <div style={{ fontSize: "0.75rem", color: "hsl(145 63% 35%)", marginTop: 2 }}>
                  Official Ministry of Earth Sciences administrative account.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Administrative Focus Areas */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "hsl(215 30% 12%)" }}>
              Administrative Competencies & Responsibilities
            </h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              style={{ background: "transparent", border: "none", color: "hsl(215 84% 30%)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
            >
              + Edit
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(profile.skills && profile.skills.length > 0
              ? profile.skills
              : ["System Administration", "Capacity Governance", "Course Moderation", "Information Security"]
            ).map((s: string) => (
              <span key={s} className="skill-pill" style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
                {s}
              </span>
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
          role: "admin",
        }}
        onProfileUpdated={(updated) => {
          setProfile((prev: any) => ({ ...prev, ...updated }));
        }}
      />
    </DashboardLayout>
  );
}
