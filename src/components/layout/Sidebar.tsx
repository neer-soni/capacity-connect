"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  BookOpen,
  LayoutDashboard,
  Award,
  Bell,
  User,
  Users,
  Home,
  Map,
  Library,
  CheckSquare,
  ShieldCheck,
  LogOut,
  X,
} from "lucide-react";

type Role = "trainee" | "trainer" | "admin";

const navItems: Record<Role, { href: string; label: string; icon: React.ReactNode }[]> = {
  trainee: [
    { href: "/trainee/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/trainee/courses", label: "My Courses", icon: <BookOpen size={18} /> },
    { href: "/trainee/profile", label: "Profile & Portfolio", icon: <User size={18} /> },
    { href: "/trainee/certificates", label: "Certificates", icon: <Award size={18} /> },
    { href: "/trainee/notifications", label: "Notifications", icon: <Bell size={18} /> },
  ],
  trainer: [
    { href: "/trainer/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/trainer/courses", label: "My Courses", icon: <BookOpen size={18} /> },
    { href: "/trainer/library", label: "Trainer Library", icon: <Library size={18} /> },
    { href: "/trainer/notifications", label: "Notifications", icon: <Bell size={18} /> },
    { href: "/trainer/profile", label: "My Profile", icon: <User size={18} /> },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/admin/users", label: "User Management", icon: <Users size={18} /> },
    { href: "/admin/courses", label: "Course Validation", icon: <CheckSquare size={18} /> },
    { href: "/admin/certificates", label: "Certificates", icon: <Award size={18} /> },
    { href: "/admin/competency", label: "Competency Map", icon: <Map size={18} /> },
    { href: "/admin/reports", label: "Moderation Queue", icon: <ShieldCheck size={18} /> },
    { href: "/admin/homepage", label: "Homepage Publisher", icon: <Home size={18} /> },
    { href: "/admin/profile", label: "Admin Profile", icon: <User size={18} /> },
  ],
};

interface SidebarProps {
  role: Role;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "";

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Brand Header */}
      <div
        style={{
          padding: "18px 16px 14px",
          borderBottom: "1px solid hsl(214 20% 90%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
          onClick={onClose}
        >
          <div
            style={{
              background: "linear-gradient(135deg, hsl(215 84% 30%), hsl(178 68% 35%))",
              borderRadius: 8,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: "0.9rem",
              flexShrink: 0,
            }}
          >
            CC
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "hsl(215 30% 12%)", lineHeight: 1.2 }}>
              Capacity Connect
            </div>
            <div
              style={{
                fontSize: "0.68rem",
                color: "hsl(215 18% 50%)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
              }}
            >
              MoES Portal
            </div>
          </div>
        </Link>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div style={{ padding: "10px 16px 6px" }}>
        <span
          className={`badge ${
            role === "admin" ? "badge-error" : role === "trainer" ? "badge-secondary" : "badge-primary"
          }`}
          style={{ fontSize: "0.7rem", padding: "2px 8px" }}
        >
          {roleLabel} Portal
        </span>
      </div>

      {/* Navigation list */}
      <nav style={{ padding: "6px 10px", flex: 1, overflowY: "auto" }}>
        {navItems[role]?.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              style={{ marginBottom: 3 }}
            >
              {item.icon}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Public Quick Links */}
      <div style={{ padding: "8px 10px", borderTop: "1px solid hsl(214 20% 90%)" }}>
        <Link
          href="/"
          className="sidebar-nav-item"
          style={{ fontSize: "0.8rem", padding: "7px 12px" }}
          onClick={onClose}
        >
          <Home size={15} />
          <span>Public Homepage</span>
        </Link>
        <Link
          href="/courses"
          className="sidebar-nav-item"
          style={{ fontSize: "0.8rem", padding: "7px 12px" }}
          onClick={onClose}
        >
          <BookOpen size={15} />
          <span>Course Catalog</span>
        </Link>
      </div>

      {/* User Profile & Sign Out Footer */}
      {user && (
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid hsl(214 20% 90%)",
            background: "hsl(210 20% 98%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <Link
            href={`/${role}/profile`}
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
              flex: 1,
              textDecoration: "none",
              cursor: "pointer",
            }}
            title="View & Edit Profile"
          >
            <div
              className="avatar"
              style={{
                width: 32,
                height: 32,
                fontSize: "0.75rem",
                flexShrink: 0,
              }}
            >
              {(user as any)?.avatar || user?.name?.slice(0, 2).toUpperCase() || "U"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "hsl(215 30% 12%)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.name || "User"}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "hsl(215 16% 57%)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.email}
              </div>
            </div>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign Out"
            style={{
              background: "white",
              border: "1px solid hsl(214 20% 90%)",
              borderRadius: 6,
              padding: "6px",
              cursor: "pointer",
              color: "hsl(0 72% 51%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(0 72% 96%)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            <LogOut size={15} />
          </button>
        </div>
      )}
    </aside>
  );
}
