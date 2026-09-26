"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Bell, LogIn, LogOut, User, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export default function Topnav() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const role = (user as any)?.role;
  const isAuth = status === "authenticated";
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (isAuth) {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setNotifCount(data.filter((n: any) => !n.read).length);
          }
        })
        .catch(() => {});
    }
  }, [isAuth]);

  const dashboardLink =
    role === "admin"
      ? "/admin/dashboard"
      : role === "trainer"
      ? "/trainer/dashboard"
      : role === "trainee"
      ? "/trainee/dashboard"
      : "/login";

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 56,
        borderBottom: "1px solid hsl(214 20% 90%)",
        background: "white",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, hsl(215 84% 30%), hsl(178 68% 35%))",
            borderRadius: 8,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 900,
            fontSize: "0.7rem",
          }}
        >
          CC
        </div>
        <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "hsl(215 30% 12%)" }}>
          Capacity Connect
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Link href="/courses" className="btn btn-ghost btn-sm" style={{ fontSize: "0.82rem" }}>
          Courses
        </Link>

        {isAuth && (
          <Link href={dashboardLink} className="btn btn-ghost btn-sm" style={{ fontSize: "0.82rem" }}>
            Dashboard
          </Link>
        )}

        {isAuth ? (
          <>
            {/* Notifications */}
            <Link
              href={`/${role}/notifications`}
              className="btn btn-ghost btn-sm"
              style={{ position: "relative" }}
            >
              <Bell size={17} />
              {notifCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    background: "hsl(0 72% 51%)",
                    color: "white",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    borderRadius: "50%",
                    width: 16,
                    height: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {notifCount}
                </span>
              )}
            </Link>

            {/* User info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 10px",
                borderRadius: 8,
                background: "hsl(210 20% 97%)",
                marginLeft: 4,
              }}
            >
              <div className="avatar" style={{ width: 28, height: 28, fontSize: "0.65rem" }}>
                {(user as any)?.avatar || "U"}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: "0.65rem", color: "hsl(215 16% 57%)", textTransform: "capitalize" }}>
                  {role}
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn btn-ghost btn-sm"
              style={{ color: "hsl(0 72% 51%)", fontSize: "0.8rem" }}
            >
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-outline btn-sm" style={{ fontSize: "0.82rem" }}>
              <LogIn size={15} /> Login
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm" style={{ fontSize: "0.82rem" }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
