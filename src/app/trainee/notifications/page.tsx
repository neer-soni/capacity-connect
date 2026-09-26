"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Bell, CheckCircle, MessageSquare, Award, Megaphone } from "lucide-react";

const typeIcons: Record<string, any> = {
  quiz: <Bell size={18} style={{ color: "hsl(215 84% 30%)" }} />,
  reply: <MessageSquare size={18} style={{ color: "hsl(178 68% 35%)" }} />,
  certificate: <Award size={18} style={{ color: "hsl(38 80% 40%)" }} />,
  announcement: <Megaphone size={18} style={{ color: "hsl(145 63% 40%)" }} />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications").then(r => r.json()).then(d => {
      setNotifications(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unread = notifications.filter(n => !n.read);

  return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>Notifications</h1>
          <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem" }}>{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <button onClick={markAllRead} className="btn btn-outline btn-sm">
            <CheckCircle size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "hsl(215 16% 57%)" }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <Bell size={36} style={{ opacity: 0.3, marginBottom: 10 }} />
          <p style={{ color: "hsl(215 16% 57%)" }}>No notifications yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map((n, i) => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className="card animate-fade-in"
              style={{
                padding: "16px 20px",
                display: "flex", gap: 14, alignItems: "center",
                cursor: n.read ? "default" : "pointer",
                background: n.read ? "white" : "hsl(215 84% 97%)",
                borderLeft: n.read ? "3px solid transparent" : "3px solid hsl(215 84% 45%)",
                animationDelay: `${i * 0.04}s`,
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "hsl(210 20% 96%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {typeIcons[n.type] || <Bell size={18} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.875rem", fontWeight: n.read ? 400 : 600, color: "hsl(215 30% 12%)" }}>{n.message}</p>
                <p style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)", marginTop: 4 }}>
                  {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "hsl(215 84% 45%)" }} />}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
