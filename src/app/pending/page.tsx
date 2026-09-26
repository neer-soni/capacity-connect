"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Clock, ArrowLeft, LogOut } from "lucide-react";

export default function PendingPage() {
  const { data: session } = useSession();

  return (
    <div style={{ minHeight: "100vh", background: "hsl(210 20% 98%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card animate-fade-in" style={{ padding: "48px", maxWidth: 520, textAlign: "center" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>⏳</div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 10 }}>Account Pending Approval</h1>
        <p style={{ color: "hsl(215 18% 38%)", lineHeight: 1.7, marginBottom: 24 }}>
          Your trainer application is under review by the platform admin. You will receive a
          notification once your account has been approved.
        </p>
        <div style={{
          background: "hsl(38 95% 96%)",
          border: "1px solid hsl(38 95% 85%)",
          borderRadius: 10,
          padding: "16px 20px",
          textAlign: "left",
          marginBottom: 28,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Clock size={16} style={{ color: "hsl(38 80% 40%)" }} />
            <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "hsl(38 80% 35%)" }}>Application Status</span>
          </div>
          {session?.user && (
            <div style={{ fontSize: "0.85rem", color: "hsl(215 18% 38%)", lineHeight: 1.8 }}>
              <p><strong>Name:</strong> {session.user.name}</p>
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>Role:</strong> <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>Trainer</span></p>
              <p><strong>Status:</strong> <span className="badge badge-warning" style={{ fontSize: "0.7rem" }}>Pending Approval</span></p>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/" className="btn btn-outline">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-ghost" style={{ color: "hsl(0 72% 51%)" }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
