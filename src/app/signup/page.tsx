"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "pending">("form");
  const [selectedRole, setSelectedRole] = useState<"trainee" | "trainer">("trainee");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("Oceanography");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: selectedRole, department }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      if (selectedRole === "trainer") {
        setStep("pending");
        setLoading(false);
        return;
      }

      // Auto-login for trainee
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but auto-login failed. Please login manually.");
        setLoading(false);
        return;
      }

      router.push("/trainee/dashboard");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (step === "pending") {
    return (
      <div style={{ minHeight: "100vh", background: "hsl(210 20% 98%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="card animate-fade-in" style={{ padding: "48px", maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>⏳</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 10 }}>Application Submitted!</h2>
          <p style={{ color: "hsl(215 18% 38%)", lineHeight: 1.7, marginBottom: 24 }}>
            Your trainer application is under review by the platform admin. You'll receive a notification once approved.
          </p>
          <div style={{ background: "hsl(215 84% 96%)", borderRadius: 10, padding: "14px 18px", marginBottom: 24, textAlign: "left", border: "1px solid hsl(215 84% 88%)" }}>
            <p style={{ fontSize: "0.82rem", color: "hsl(215 18% 38%)" }}>
              <strong>Status:</strong> <span className="badge badge-warning">Pending Approval</span>
            </p>
            <p style={{ fontSize: "0.82rem", color: "hsl(215 18% 38%)", marginTop: 8 }}>
              You can login after your account is approved.
            </p>
          </div>
          <Link href="/login" className="btn btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "hsl(210 20% 98%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              background: "linear-gradient(135deg, hsl(215 84% 30%), hsl(178 68% 35%))",
              borderRadius: 12, width: 52, height: 52,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 900, fontSize: "1.1rem", margin: "0 auto 14px",
            }}
          >CC</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>Create your account</h1>
          <p style={{ fontSize: "0.875rem", color: "hsl(215 16% 57%)" }}>Join Capacity Connect · MoES Training Portal</p>
        </div>

        <div className="card animate-fade-in" style={{ padding: "32px" }}>
          {/* Role selector */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 10 }}>I am joining as a...</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { role: "trainee" as const, label: "Trainee", desc: "I want to enroll in courses and get certified", icon: "🎓" },
                { role: "trainer" as const, label: "Trainer", desc: "I want to create and deliver training programs", icon: "👩‍🏫" },
              ].map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setSelectedRole(r.role)}
                  style={{
                    padding: "14px", border: `2px solid ${selectedRole === r.role ? "hsl(215 84% 30%)" : "hsl(214 20% 90%)"}`,
                    borderRadius: 10, background: selectedRole === r.role ? "hsl(215 84% 96%)" : "white",
                    cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: "1.3rem", marginBottom: 6 }}>{r.icon}</div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "hsl(215 30% 12%)" }}>{r.label}</div>
                  <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)", marginTop: 2, lineHeight: 1.4 }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: "hsl(0 72% 96%)", border: "1px solid hsl(0 72% 88%)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
              <AlertCircle size={16} style={{ color: "hsl(0 72% 51%)", flexShrink: 0 }} />
              <p style={{ fontSize: "0.82rem", color: "hsl(0 72% 40%)" }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Full Name *</label>
              <input className="input" placeholder="Dr. Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Email *</label>
              <input type="email" className="input" placeholder="you@moes.gov.in" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Department</label>
              <select className="input" value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option>Oceanography</option>
                <option>Climate Science</option>
                <option>Atmospheric Sciences</option>
                <option>Seismology</option>
                <option>Deep Sea Research</option>
                <option>Space Applications</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Password *</label>
              <input type="password" className="input" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            {selectedRole === "trainer" && (
              <div style={{ background: "hsl(38 95% 96%)", border: "1px solid hsl(38 95% 85%)", borderRadius: 8, padding: "12px 14px" }}>
                <p style={{ fontSize: "0.8rem", color: "hsl(38 80% 35%)" }}>
                  📋 Trainer accounts require admin approval before you can access the platform.
                </p>
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? (
                <><Loader2 size={18} className="spin" /> Creating account...</>
              ) : (
                <>{selectedRole === "trainer" ? "Apply as Trainer" : "Create Account"} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "hsl(215 16% 57%)", marginTop: 20 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "hsl(215 84% 30%)", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
