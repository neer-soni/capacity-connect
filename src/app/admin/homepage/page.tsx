"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Trash2, Send, Megaphone, Loader } from "lucide-react";

interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  type: string;
  icon: string;
  createdAt: string;
  publisher?: { name: string };
}

export default function AdminHomepagePage() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("announcement");
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      }
    } catch {}
    setLoading(false);
  }

  async function handlePublish() {
    if (!title.trim() || !body.trim()) {
      alert("Title and content are required.");
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, type }),
      });
      if (res.ok) {
        setTitle("");
        setBody("");
        setType("announcement");
        setShowForm(false);
        await fetchAnnouncements();
      } else {
        alert("Failed to publish. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setPublishing(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await fetchAnnouncements();
      }
    } catch {}
    setDeleting(null);
  }

  return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>Homepage Publisher</h1>
          <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem" }}>Publish announcements and notifications to all trainers and trainees</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card animate-fade-in" style={{ padding: "28px", marginBottom: 24 }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 18 }}>
            <Megaphone size={18} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 8 }} />
            Create New Announcement
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Title *</label>
                <input className="input" placeholder="e.g. New Course: Deep Sea Exploration" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Type</label>
                <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="announcement">📢 Announcement</option>
                  <option value="achievement">🏆 Achievement</option>
                  <option value="notification">🔧 Notification</option>
                  <option value="new_content">📚 New Content</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Content *</label>
              <textarea className="input" rows={4} placeholder="Write your announcement here..." value={body} onChange={(e) => setBody(e.target.value)} style={{ resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePublish} disabled={publishing}>
                {publishing ? <><Loader size={14} className="spin" /> Publishing...</> : <><Send size={14} /> Publish & Notify All</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing posts */}
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Published Posts ({announcements.length})</h2>
      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "hsl(215 16% 57%)" }}>Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "hsl(215 16% 57%)" }}>No announcements published yet</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {announcements.map((a, i) => (
            <div key={a.id} className="card animate-fade-in" style={{ padding: "20px", display: "flex", gap: 16, alignItems: "flex-start", animationDelay: `${i * 0.05}s` }}>
              <div style={{ fontSize: "2rem", flexShrink: 0 }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span className={`badge ${a.type === "achievement" ? "badge-warning" : a.type === "announcement" ? "badge-primary" : "badge-muted"}`} style={{ fontSize: "0.7rem" }}>
                    {a.type}
                  </span>
                  <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>Published</span>
                </div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 6 }}>{a.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "hsl(215 18% 38%)", lineHeight: 1.6 }}>{a.body}</p>
                <p style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)", marginTop: 8 }}>
                  Published: {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  {a.publisher?.name && ` · By ${a.publisher.name}`}
                </p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: "hsl(0 72% 51%)" }}
                onClick={() => handleDelete(a.id)}
                disabled={deleting === a.id}
              >
                {deleting === a.id ? <Loader size={13} className="spin" /> : <Trash2 size={13} />} Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
