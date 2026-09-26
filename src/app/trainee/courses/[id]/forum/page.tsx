"use client";
import { use, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockForumThreads, mockCourses } from "@/lib/mock-data";
import { ArrowLeft, MessageSquare, ThumbsUp, CheckCircle, Plus } from "lucide-react";
import Link from "next/link";

export default function ForumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<any>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const [localVotes, setLocalVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load course
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((data) => setCourse(data))
      .catch(() => {});

    // Load forum threads
    fetch(`/api/courses/${id}/forum`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setThreads(data);
          setSelectedThread(data[0]?.id || null);
        } else {
          // Fallback to sample threads
          const sample = mockForumThreads.slice(0, 3).map((t, idx) => ({ ...t, id: `sample-${idx}` }));
          setThreads(sample);
          setSelectedThread(sample[0]?.id || null);
        }
      })
      .catch(() => {
        const sample = mockForumThreads.slice(0, 3).map((t, idx) => ({ ...t, id: `sample-${idx}` }));
        setThreads(sample);
        setSelectedThread(sample[0]?.id || null);
      });
  }, [id]);

  const thread = threads.find((t) => t.id === selectedThread) || threads[0];

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href={`/trainee/courses/${id}/learn`} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Course Forum</h1>
          <p style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)" }}>{course?.title}</p>
        </div>
        <button
          onClick={() => setShowNewThread(!showNewThread)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={15} /> New Thread
        </button>
      </div>

      {/* New thread form */}
      {showNewThread && (
        <div className="card animate-fade-in" style={{ padding: "20px", marginBottom: 20 }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 14 }}>New Discussion Thread</h3>
          <input className="input" placeholder="Thread title..." style={{ marginBottom: 10 }} />
          <textarea
            className="input"
            placeholder="What would you like to discuss or ask?"
            rows={3}
            style={{ resize: "vertical", marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", cursor: "pointer" }}>
              <input type="checkbox" /> Mark as Question (enables accepted answer)
            </label>
            <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }}>Post Thread</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowNewThread(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, minHeight: 500 }}>
        {/* Thread list */}
        <div className="card" style={{ padding: "12px", height: "fit-content" }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 700, padding: "6px 8px", color: "hsl(215 18% 38%)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            Threads ({threads.length})
          </h3>
          {threads.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px 12px" }}>
              <MessageSquare size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
              <p style={{ fontSize: "0.82rem" }}>No threads yet. Be the first!</p>
            </div>
          ) : (
            threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedThread(t.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px",
                  borderRadius: 8,
                  border: t.id === selectedThread ? "1px solid hsl(215 84% 88%)" : "1px solid transparent",
                  background: t.id === selectedThread ? "hsl(215 84% 96%)" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  marginBottom: 4,
                }}
              >
                <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  {t.isQuestion && <span className="badge badge-warning" style={{ fontSize: "0.65rem" }}>Q&A</span>}
                  {t.acceptedReplyId && <span className="badge badge-success" style={{ fontSize: "0.65rem" }}>✓ Solved</span>}
                </div>
                <div style={{ fontSize: "0.83rem", fontWeight: 600, color: "hsl(215 30% 12%)", lineHeight: 1.4, marginBottom: 4 }}>
                  {t.title}
                </div>
                <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>
                  {t.replies.length} replies · {t.upvotes} upvotes
                </div>
              </button>
            ))
          )}
        </div>

        {/* Thread detail */}
        {thread ? (
          <div>
            {/* Original post */}
            <div className="card" style={{ padding: "22px", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <div className="avatar" style={{ width: 38, height: 38 }}>{thread.authorAvatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{thread.author}</span>
                    {thread.isQuestion && <span className="badge badge-warning" style={{ fontSize: "0.7rem" }}>Question</span>}
                  </div>
                  <h2 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: 8, lineHeight: 1.4 }}>{thread.title}</h2>
                  <p style={{ fontSize: "0.875rem", color: "hsl(215 18% 38%)", lineHeight: 1.7 }}>{thread.body}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, paddingTop: 10, borderTop: "1px solid hsl(214 20% 92%)" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setLocalVotes((p) => ({ ...p, [thread.id]: (p[thread.id] || 0) + 1 }))}
                >
                  <ThumbsUp size={14} /> {(thread.upvotes || 0) + (localVotes[thread.id] || 0)}
                </button>
                <span style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)", alignSelf: "center" }}>
                  {thread.createdAt ? new Date(thread.createdAt).toLocaleDateString("en-IN") : "Recent"}
                </span>
              </div>
            </div>

            {/* Replies */}
            {(thread.replies || []).map((reply: any) => (
              <div
                key={reply.id}
                className={reply.id === thread.acceptedReplyId ? "card accepted-answer" : "card"}
                style={{ padding: "18px", marginBottom: 12 }}
              >
                {reply.id === thread.acceptedReplyId && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, color: "hsl(145 63% 35%)", fontSize: "0.8rem", fontWeight: 700 }}>
                    <CheckCircle size={15} /> Accepted Answer
                  </div>
                )}
                <div style={{ display: "flex", gap: 12 }}>
                  <div className="avatar" style={{ width: 34, height: 34, fontSize: "0.72rem" }}>
                    {reply.author?.avatar || reply.authorAvatar || "U"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {reply.author?.name || reply.author || "User"}
                      </span>
                      {(reply.isTrainer || reply.author?.role === "trainer") && (
                        <span className="badge badge-secondary" style={{ fontSize: "0.68rem" }}>✓ Trainer</span>
                      )}
                      <span style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>
                        {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString("en-IN") : "Recent"}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "hsl(215 18% 38%)", lineHeight: 1.7 }}>
                      {reply.body || reply.content}
                    </p>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ marginTop: 8 }}
                      onClick={() => setLocalVotes((p) => ({ ...p, [reply.id]: (p[reply.id] || 0) + 1 }))}
                    >
                      <ThumbsUp size={13} /> {reply.upvotes + (localVotes[reply.id] || 0)}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Reply box */}
            <div className="card" style={{ padding: "18px" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 10 }}>Add a Reply</h4>
              <textarea
                className="input"
                placeholder="Share your thoughts or answer..."
                rows={3}
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                style={{ resize: "vertical", marginBottom: 10 }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setNewReply("")}
                >
                  Post Reply
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ border: "1px solid hsl(214 20% 90%)", borderRadius: 12 }}>
            <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: 10 }} />
            <p>Select a thread to read</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
