"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

type Role = "trainee" | "trainer" | "admin";

export default function DashboardLayout({
  children,
  role: explicitRole,
}: {
  children: React.ReactNode;
  role?: Role;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use explicit role prop if provided, otherwise get from session
  const role = explicitRole || ((session?.user as any)?.role as Role);

  // Redirect unauthenticated users via useEffect (avoids setState-during-render warning)
  const needsRedirect = status === "unauthenticated" || (status === "authenticated" && !role);

  useEffect(() => {
    if (needsRedirect) {
      router.push("/login");
    }
  }, [needsRedirect, router]);

  if (status === "loading" || needsRedirect) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "hsl(210 20% 98%)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
          <p style={{ color: "hsl(215 16% 57%)", fontSize: "0.9rem" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      {/* Mobile drawer backdrop */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Persistent / Drawer Sidebar */}
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main layout container (offset by sidebar-width on desktop) */}
      <div className="dashboard-main">
        {/* Mobile Header Bar */}
        <header className="mobile-topbar">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 6,
              color: "hsl(215 30% 12%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
            }}
            aria-label="Toggle navigation menu"
          >
            <Menu size={22} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                background: "linear-gradient(135deg, hsl(215 84% 30%), hsl(178 68% 35%))",
                borderRadius: 6,
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 800,
                fontSize: "0.75rem",
              }}
            >
              CC
            </div>
            <span style={{ fontWeight: 800, fontSize: "0.92rem", color: "hsl(215 30% 12%)" }}>
              Capacity Connect
            </span>
          </div>

          <div
            className="avatar"
            style={{ width: 30, height: 30, fontSize: "0.72rem" }}
          >
            {(session?.user as any)?.avatar || session?.user?.name?.slice(0, 2).toUpperCase() || "U"}
          </div>
        </header>

        {/* Page Content with Screen Ratio Constraint */}
        <main className="main-content">
          <div className="dashboard-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
