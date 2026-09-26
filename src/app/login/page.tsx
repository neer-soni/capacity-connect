"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Try: priya@moes.gov.in / password123");
        setLoading(false);
        return;
      }

      // Fetch session to get role for redirect
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;
      const status = session?.user?.status;

      if (status === "pending") {
        router.push("/pending");
        return;
      }

      const target =
        callbackUrl ||
        (role === "admin"
          ? "/admin/dashboard"
          : role === "trainer"
          ? "/trainer/dashboard"
          : "/trainee/dashboard");

      router.push(target);
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const quickLogin = async (email: string) => {
    setEmail(email);
    setPassword("password123");
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password: "password123",
      redirect: false,
    });

    if (result?.error) {
      setError("Quick login failed.");
      setLoading(false);
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;
    const status = session?.user?.status;

    if (status === "pending") {
      router.push("/pending");
      return;
    }

    router.push(
      role === "admin"
        ? "/admin/dashboard"
        : role === "trainer"
        ? "/trainer/dashboard"
        : "/trainee/dashboard"
    );
    router.refresh();
  };

  return (
    <div style={{ minHeight: "100vh", background: "hsl(210 20% 98%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              background: "linear-gradient(135deg, hsl(215 84% 30%), hsl(178 68% 35%))",
              borderRadius: 12,
              width: 52,
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 900,
              fontSize: "1.1rem",
              margin: "0 auto 14px",
            }}
          >
            CC
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>Welcome back</h1>
          <p style={{ fontSize: "0.875rem", color: "hsl(215 16% 57%)" }}>Sign in to Capacity Connect</p>
        </div>

        <div className="card animate-fade-in" style={{ padding: "32px" }}>
          {/* Quick login buttons */}
          <div style={{ background: "hsl(215 84% 96%)", borderRadius: 10, padding: "14px 16px", marginBottom: 24, border: "1px solid hsl(215 84% 88%)" }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "hsl(215 84% 30%)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              🎭 Quick Demo Login
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => quickLogin("priya@moes.gov.in")}
                disabled={loading}
                className="btn btn-sm btn-outline"
                style={{ flex: 1, fontSize: "0.78rem" }}
              >
                🎓 Trainee
              </button>
              <button
                onClick={() => quickLogin("rajesh@moes.gov.in")}
                disabled={loading}
                className="btn btn-sm btn-outline"
                style={{ flex: 1, fontSize: "0.78rem" }}
              >
                👩‍🏫 Trainer
              </button>
              <button
                onClick={() => quickLogin("admin@moes.gov.in")}
                disabled={loading}
                className="btn btn-sm btn-outline"
                style={{ flex: 1, fontSize: "0.78rem" }}
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "hsl(0 72% 96%)", border: "1px solid hsl(0 72% 88%)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
              <AlertCircle size={16} style={{ color: "hsl(0 72% 51%)", flexShrink: 0 }} />
              <p style={{ fontSize: "0.82rem", color: "hsl(0 72% 40%)" }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@moes.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "hsl(215 16% 57%)" }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? (
                <><Loader2 size={18} className="spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "hsl(215 16% 57%)", marginTop: 20 }}>
            Don't have an account?{" "}
            <Link href="/signup" style={{ color: "hsl(215 84% 30%)", fontWeight: 600 }}>
              Sign up
            </Link>
          </p>
        </div>
        <p style={{ textAlign: "center", fontSize: "0.78rem", color: "hsl(215 16% 57%)", marginTop: 20 }}>
          Ministry of Earth Sciences · Secure Government Portal
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} className="spin" style={{ color: "hsl(215 84% 30%)" }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
