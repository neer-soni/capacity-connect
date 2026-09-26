"use client";
import { use, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  Plus,
  Loader2,
  Send,
  Award,
} from "lucide-react";
import Link from "next/link";

interface Author {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface Reply {
  id: string;
  threadId: string;
  parentReplyId: string | null;
  authorId: string;
  body: string;
  upvotes: number;
  isDeleted: boolean;
  createdAt: string;
  author: Author;
}

interface Thread {
  id: string;
  courseId: string;
  authorId: string;
  title: string;
  body: string;
  isQuestion: boolean;
  acceptedReplyId: string | null;
  upvotes: number;
  createdAt: string;
  author: Author;
  replies: Reply[];
}

export default function TrainerForumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [course, setCourse] = useState<any>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // New thread form state
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadBody, setNewThreadBody] = useState("");
  const [newThreadIsQuestion, setNewThreadIsQuestion] = useState(false);
  const [submittingThread, setSubmittingThread] = useState(false);

  // Reply state
  const [newReply, setNewReply] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Track upvoted items
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${id}/forum`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setThreads(data);
        setSelectedThread((prev) => {
          if (prev && data.some((t: Thread) => t.id === prev)) return prev;
          return data[0]?.id || null;
        });
      }
    } catch {
      console.error("Failed to load forum threads");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((data) => setCourse(data))
      .catch(() => {});

    fetchThreads();
  }, [id, fetchThreads]);

  const thread = threads.find((t) => t.id === selectedThread) || null;

  // ── Create Thread ────────────────────────────────────────────────
  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || !newThreadBody.trim()) return;
    setSubmittingThread(true);
    try {
      const res = await fetch(`/api/courses/${id}/forum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newThreadTitle.trim(),
          body: newThreadBody.trim(),
          isQuestion: newThreadIsQuestion,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create thread");
        return;
      }
      setNewThreadTitle("");
      setNewThreadBody("");
      setNewThreadIsQuestion(false);
      setShowNewThread(false);
      await fetchThreads();
    } catch {
      alert("Network error — could not create thread");
    } finally {
      setSubmittingThread(false);
    }
  };

  // ── Post Reply ───────────────────────────────────────────────────
  const handlePostReply = async () => {
    if (!newReply.trim() || !thread) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/forum/${thread.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newReply.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to post reply");
        return;
      }
      setNewReply("");
      await fetchThreads();
    } catch {
      alert("Network error — could not post reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  // ── Upvote ───────────────────────────────────────────────────────
  const handleUpvoteThread = async (threadId: string) => {
    if (votedIds.has(`thread-${threadId}`)) return;
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, upvotes: t.upvotes + 1 } : t))
    );
    setVotedIds((prev) => new Set(prev).add(`thread-${threadId}`));
    try {
      await fetch(`/api/forum/${threadId}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadUpvote: true }),
      });
    } catch {
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, upvotes: t.upvotes - 1 } : t))
      );
      setVotedIds((prev) => { const n = new Set(prev); n.delete(`thread-${threadId}`); return n; });
    }
  };

  const handleUpvoteReply = async (threadId: string, replyId: string) => {
    if (votedIds.has(`reply-${replyId}`)) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, replies: t.replies.map((r) => (r.id === replyId ? { ...r, upvotes: r.upvotes + 1 } : r)) }
          : t
      )
    );
    setVotedIds((prev) => new Set(prev).add(`reply-${replyId}`));
    try {
      await fetch(`/api/forum/${threadId}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyId }),
      });
    } catch {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, replies: t.replies.map((r) => (r.id === replyId ? { ...r, upvotes: r.upvotes - 1 } : r)) }
            : t
        )
      );
      setVotedIds((prev) => { const n = new Set(prev); n.delete(`reply-${replyId}`); return n; });
    }
  };

  // ── Accept Answer (Trainer only for Q&A threads) ─────────────────
  const handleAcceptAnswer = async (threadId: string, replyId: string) => {
    try {
      const res = await fetch(`/api/courses/${id}/forum`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, acceptedReplyId: replyId }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to accept answer");
        return;
      }
      await fetchThreads();
    } catch {
      alert("Network error");
    }
  };

  // Helper: avatar initials
  const getInitials = (author: Author | undefined) => {
    if (!author) return "U";
    if (author.avatar) return author.avatar;
    return author.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href={`/trainer/courses/${id}`} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Course Forum</h1>
          <p style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)" }}>{course?.title} — Trainer View</p>
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
          <input
            className="input"
            placeholder="Thread title..."
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <textarea
            className="input"
            placeholder="What would you like to discuss?"
            rows={3}
            value={newThreadBody}
            onChange={(e) => setNewThreadBody(e.target.value)}
            style={{ resize: "vertical", marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={newThreadIsQuestion}
                onChange={(e) => setNewThreadIsQuestion(e.target.checked)}
              />
              Mark as Question
            </label>
            <button
              className="btn btn-primary btn-sm"
              style={{ marginLeft: "auto" }}
              disabled={submittingThread || !newThreadTitle.trim() || !newThreadBody.trim()}
              onClick={handleCreateThread}
            >
              {submittingThread ? <><Loader2 size={14} className="spinner" /> Posting...</> : "Post Thread"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowNewThread(false)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Loader2 size={32} className="spinner" style={{ color: "hsl(215 84% 52%)" }} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, minHeight: 500 }}>
          {/* Thread list */}
          <div className="card" style={{ padding: "12px", height: "fit-content" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, padding: "6px 8px", color: "hsl(215 18% 38%)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Threads ({threads.length})
            </h3>
            {threads.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px 12px" }}>
                <MessageSquare size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
                <p style={{ fontSize: "0.82rem" }}>No threads yet.</p>
              </div>
            ) : (
              threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedThread(t.id); setNewReply(""); }}
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
                    {t.author?.name || "Unknown"} · {t.replies.length} replies · {t.upvotes} upvotes
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
                  <div className="avatar" style={{ width: 38, height: 38 }}>{getInitials(thread.author)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{thread.author?.name || "Unknown"}</span>
                      {thread.author?.role === "trainer" && (
                        <span className="badge badge-secondary" style={{ fontSize: "0.68rem" }}>✓ Trainer</span>
                      )}
                      {thread.isQuestion && <span className="badge badge-warning" style={{ fontSize: "0.7rem" }}>Question</span>}
                    </div>
                    <h2 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: 8, lineHeight: 1.4 }}>{thread.title}</h2>
                    <p style={{ fontSize: "0.875rem", color: "hsl(215 18% 38%)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{thread.body}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, paddingTop: 10, borderTop: "1px solid hsl(214 20% 92%)" }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleUpvoteThread(thread.id)}
                    disabled={votedIds.has(`thread-${thread.id}`)}
                    style={{ color: votedIds.has(`thread-${thread.id}`) ? "hsl(215 84% 52%)" : undefined }}
                  >
                    <ThumbsUp size={14} /> {thread.upvotes}
                  </button>
                  <span style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)", alignSelf: "center" }}>
                    {new Date(thread.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Replies */}
              {thread.replies.length > 0 && (
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 10, color: "hsl(215 18% 38%)" }}>
                  {thread.replies.length} {thread.replies.length === 1 ? "Reply" : "Replies"}
                </h4>
              )}
              {thread.replies.map((reply) => (
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
                      {getInitials(reply.author)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{reply.author?.name || "User"}</span>
                        {reply.author?.role === "trainer" && (
                          <span className="badge badge-secondary" style={{ fontSize: "0.68rem" }}>✓ Trainer</span>
                        )}
                        <span style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>
                          {new Date(reply.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "hsl(215 18% 38%)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                        {reply.body}
                      </p>
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleUpvoteReply(thread.id, reply.id)}
                          disabled={votedIds.has(`reply-${reply.id}`)}
                          style={{ color: votedIds.has(`reply-${reply.id}`) ? "hsl(215 84% 52%)" : undefined }}
                        >
                          <ThumbsUp size={13} /> {reply.upvotes}
                        </button>
                        {/* Accept answer button — only for Q&A threads, only for the course trainer */}
                        {thread.isQuestion && reply.id !== thread.acceptedReplyId && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: "hsl(145 63% 35%)" }}
                            onClick={() => handleAcceptAnswer(thread.id, reply.id)}
                            title="Mark as accepted answer"
                          >
                            <Award size={13} /> Accept Answer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Reply box */}
              <div className="card" style={{ padding: "18px", marginTop: thread.replies.length > 0 ? 4 : 0 }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 10 }}>Add a Reply</h4>
                <textarea
                  className="input"
                  placeholder="Reply as trainer..."
                  rows={3}
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  style={{ resize: "vertical", marginBottom: 10 }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handlePostReply}
                    disabled={submittingReply || !newReply.trim()}
                  >
                    {submittingReply ? (
                      <><Loader2 size={14} className="spinner" /> Posting...</>
                    ) : (
                      <><Send size={14} /> Post Reply</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ border: "1px solid hsl(214 20% 90%)", borderRadius: 12 }}>
              <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: 10 }} />
              <p>{threads.length === 0 ? "No forum threads yet for this course" : "Select a thread to read"}</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
