"use client";
import { useState, useEffect } from "react";
import { X, Check, Lock, User, Building, Briefcase, Sparkles, Key, AlertCircle } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    department?: string;
    designation?: string;
    avatar?: string;
    skills?: string[];
    role?: string;
  };
  onProfileUpdated: (updatedUser: any) => void;
}

const MOES_DEPARTMENTS = [
  "INCOIS — Indian National Centre for Ocean Information Services",
  "IMD — India Meteorological Department",
  "IITM — Indian Institute of Tropical Meteorology",
  "NCMRWF — National Centre for Medium Range Weather Forecasting",
  "NCPOR — National Centre for Polar and Ocean Research",
  "NIOT — National Institute of Ocean Technology",
  "CMLRE — Centre for Marine Living Resources and Ecology",
  "NCCR — National Centre for Coastal Research",
  "MoES HQ — Ministry of Earth Sciences Headquarters",
  "Autonomous Research Fellow",
];

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name || "");
  const [department, setDepartment] = useState(user.department || "");
  const [designation, setDesignation] = useState(user.designation || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [newSkillInput, setNewSkillInput] = useState("");

  // Password fields
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setName(user.name || "");
    setDepartment(user.department || "");
    setDesignation(user.designation || "");
    setAvatar(user.avatar || user.name?.slice(0, 2).toUpperCase() || "");
    setSkills(user.skills || []);
    setError(null);
    setSuccess(null);
    setShowPasswordChange(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Please provide a name.");
      return;
    }

    if (showPasswordChange) {
      if (!currentPassword) {
        setError("Please enter your current password.");
        return;
      }
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New password and confirm password do not match.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        department: department.trim(),
        designation: designation.trim(),
        avatar: avatar.trim() || name.trim().slice(0, 2).toUpperCase(),
        skills,
      };

      if (showPasswordChange && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      onProfileUpdated(data.user);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: 580,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "white",
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid hsl(214 20% 90%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "hsl(215 84% 96%)",
                color: "hsl(215 84% 30%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "hsl(215 30% 12%)" }}>
                Edit Profile
              </h2>
              <p style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)" }}>
                Update your official MoES credentials & personal details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 6,
              color: "hsl(215 16% 57%)",
              borderRadius: 6,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "hsl(0 72% 96%)",
                color: "hsl(0 72% 40%)",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
                border: "1px solid hsl(0 72% 88%)",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "hsl(145 63% 95%)",
                color: "hsl(145 63% 28%)",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
                border: "1px solid hsl(145 63% 85%)",
              }}
            >
              <Check size={16} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          {/* Avatar Preview & Custom initials */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 16px",
              background: "hsl(210 20% 98%)",
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <div
              className="avatar"
              style={{ width: 52, height: 52, fontSize: "1.1rem", flexShrink: 0 }}
            >
              {avatar || name.slice(0, 2).toUpperCase() || "CC"}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "hsl(215 18% 38%)", display: "block", marginBottom: 4 }}>
                Avatar Initials / Icon
              </label>
              <input
                type="text"
                className="input"
                maxLength={4}
                value={avatar}
                onChange={(e) => setAvatar(e.target.value.toUpperCase())}
                placeholder={name.slice(0, 2).toUpperCase() || "PS"}
                style={{ width: 100, padding: "6px 10px", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          {/* Name & Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "hsl(215 30% 12%)", display: "block", marginBottom: 6 }}>
                Full Name *
              </label>
              <input
                type="text"
                className="input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Priya Sharma"
              />
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "hsl(215 30% 12%)", display: "block", marginBottom: 6 }}>
                Official Email
              </label>
              <input
                type="email"
                className="input"
                disabled
                value={user.email}
                style={{ background: "hsl(210 20% 95%)", cursor: "not-allowed", color: "hsl(215 16% 57%)" }}
              />
            </div>
          </div>

          {/* Department & Designation */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "hsl(215 30% 12%)", display: "block", marginBottom: 6 }}>
                MoES Institute / Dept
              </label>
              <select
                className="input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select Institute / Department</option>
                {MOES_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept.split(" — ")[0]}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "hsl(215 30% 12%)", display: "block", marginBottom: 6 }}>
                Designation / Position
              </label>
              <input
                type="text"
                className="input"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Scientist C, Research Fellow"
              />
            </div>
          </div>

          {/* Skills / Expertise Tags */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "hsl(215 30% 12%)", display: "block", marginBottom: 6 }}>
              Specializations & Skills
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                padding: "8px 10px",
                border: "1px solid hsl(214 20% 90%)",
                borderRadius: 8,
                background: "white",
                minHeight: 44,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="skill-pill"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: "hsl(0 72% 51%)",
                      display: "flex",
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)" }}>
                  No skills added yet
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                className="input"
                style={{ flex: 1, padding: "7px 12px", fontSize: "0.82rem" }}
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Type a skill (e.g. Climate Modeling, GIS) and press Add"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="btn btn-outline btn-sm"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Password Change Toggle */}
          <div
            style={{
              borderTop: "1px solid hsl(214 20% 90%)",
              paddingTop: 16,
              marginBottom: 20,
            }}
          >
            <button
              type="button"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "hsl(215 84% 30%)",
                fontWeight: 700,
                fontSize: "0.85rem",
                padding: 0,
              }}
            >
              <Key size={15} />
              {showPasswordChange ? "Cancel Password Change" : "Change Account Password"}
            </button>

            {showPasswordChange && (
              <div
                className="animate-fade-in"
                style={{
                  marginTop: 14,
                  padding: "16px",
                  background: "hsl(210 20% 98%)",
                  borderRadius: 10,
                  border: "1px solid hsl(214 20% 90%)",
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: 4 }}>
                    Current Password *
                  </label>
                  <input
                    type="password"
                    className="input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing password"
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: 4 }}>
                      New Password *
                    </label>
                    <input
                      type="password"
                      className="input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      className="input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              paddingTop: 12,
              borderTop: "1px solid hsl(214 20% 90%)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={saving}
              style={{ gap: 6 }}
            >
              {saving ? (
                <>⏳ Saving Changes...</>
              ) : (
                <>
                  <Check size={16} /> Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
