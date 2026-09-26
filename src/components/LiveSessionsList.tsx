"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Video,
  Calendar,
  Clock,
  Plus,
  Play,
  Users,
  X,
  Loader2,
  Radio,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { format, formatDistanceToNow, isPast, isFuture } from "date-fns";

interface LiveSession {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  duration: number;
  startedAt: string | null;
  endedAt: string | null;
  status: string;
  roomId: string;
  trainer: { id: string; name: string; avatar: string };
  _count: { attendances: number };
}

interface LiveSessionsListProps {
  courseId: string;
  courseTitle: string;
  isTrainer: boolean;
  onJoinSession: (sessionId: string) => void;
}

export default function LiveSessionsList({
  courseId,
  courseTitle,
  isTrainer,
  onJoinSession,
}: LiveSessionsListProps) {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    duration: 60,
  });

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/live`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error("Failed to fetch live sessions:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchSessions();
    // Refresh every 30 seconds to catch status changes
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch(`/api/courses/${courseId}/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ title: "", description: "", scheduledAt: "", duration: 60 });
        fetchSessions();
      }
    } catch (err) {
      console.error("Failed to create session:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      await fetch(`/api/courses/${courseId}/live/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      // Join the room after starting
      onJoinSession(sessionId);
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to cancel this session?")) return;
    try {
      await fetch(`/api/courses/${courseId}/live/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      fetchSessions();
    } catch (err) {
      console.error("Failed to cancel session:", err);
    }
  };

  const handleGoLiveNow = async () => {
    setCreating(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Live Class — ${courseTitle}`,
          description: "Instant live class",
          scheduledAt: new Date().toISOString(),
          duration: 60,
        }),
      });

      if (res.ok) {
        const session = await res.json();
        // Immediately start the session
        await fetch(`/api/courses/${courseId}/live/${session.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start" }),
        });
        onJoinSession(session.id);
      }
    } catch (err) {
      console.error("Failed to go live:", err);
    } finally {
      setCreating(false);
    }
  };

  const liveSessions = sessions.filter((s) => s.status === "live");
  const upcomingSessions = sessions.filter((s) => s.status === "scheduled");
  const pastSessions = sessions.filter(
    (s) => s.status === "ended" || s.status === "cancelled"
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <span className="session-badge live">
            <Radio size={12} /> LIVE
          </span>
        );
      case "scheduled":
        return (
          <span className="session-badge scheduled">
            <Clock size={12} /> Scheduled
          </span>
        );
      case "ended":
        return (
          <span className="session-badge ended">
            <CheckCircle2 size={12} /> Ended
          </span>
        );
      case "cancelled":
        return (
          <span className="session-badge cancelled">
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="live-sessions-loading">
        <Loader2 className="spinner" size={24} />
        <p>Loading live sessions...</p>
      </div>
    );
  }

  return (
    <div className="live-sessions-container">
      {/* Actions Bar */}
      {isTrainer && (
        <div className="live-actions-bar">
          <button onClick={handleGoLiveNow} className="btn-go-live" disabled={creating}>
            {creating ? <Loader2 size={16} className="spinner" /> : <Play size={16} />}
            Go Live Now
          </button>
          <button onClick={() => setShowModal(true)} className="btn-schedule">
            <Calendar size={16} /> Schedule Class
          </button>
        </div>
      )}

      {/* Live Now Section */}
      {liveSessions.length > 0 && (
        <div className="sessions-section">
          <h3 className="section-title live-title">
            <Radio size={18} /> Live Now
          </h3>
          {liveSessions.map((s) => (
            <div key={s.id} className="session-card live-card">
              <div className="session-info">
                <div className="session-header">
                  {getStatusBadge(s.status)}
                  <h4>{s.title}</h4>
                </div>
                {s.description && <p className="session-desc">{s.description}</p>}
                <div className="session-meta">
                  <span>
                    <Users size={14} /> {s._count.attendances} attending
                  </span>
                  <span>
                    <Clock size={14} /> Started{" "}
                    {s.startedAt
                      ? formatDistanceToNow(new Date(s.startedAt), {
                          addSuffix: true,
                        })
                      : "just now"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onJoinSession(s.id)}
                className="btn-join-live"
              >
                <Video size={16} /> Join Now <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Section */}
      {upcomingSessions.length > 0 && (
        <div className="sessions-section">
          <h3 className="section-title">
            <Calendar size={18} /> Upcoming
          </h3>
          {upcomingSessions.map((s) => (
            <div key={s.id} className="session-card">
              <div className="session-info">
                <div className="session-header">
                  {getStatusBadge(s.status)}
                  <h4>{s.title}</h4>
                </div>
                {s.description && <p className="session-desc">{s.description}</p>}
                <div className="session-meta">
                  <span>
                    <Calendar size={14} />{" "}
                    {format(new Date(s.scheduledAt), "PPp")}
                  </span>
                  <span>
                    <Clock size={14} /> {s.duration} min
                  </span>
                  <span>by {s.trainer.name}</span>
                </div>
              </div>
              <div className="session-actions">
                {isTrainer && (
                  <>
                    <button
                      onClick={() => handleStartSession(s.id)}
                      className="btn-start"
                    >
                      <Play size={14} /> Start
                    </button>
                    <button
                      onClick={() => handleCancelSession(s.id)}
                      className="btn-cancel"
                    >
                      <X size={14} />
                    </button>
                  </>
                )}
                {!isTrainer && (
                  <span className="waiting-label">
                    {isPast(new Date(s.scheduledAt))
                      ? "Starting soon..."
                      : `In ${formatDistanceToNow(new Date(s.scheduledAt))}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past Section */}
      {pastSessions.length > 0 && (
        <div className="sessions-section">
          <h3 className="section-title past-title">
            <CheckCircle2 size={18} /> Past Sessions
          </h3>
          {pastSessions.slice(0, 5).map((s) => (
            <div key={s.id} className="session-card past-card">
              <div className="session-info">
                <div className="session-header">
                  {getStatusBadge(s.status)}
                  <h4>{s.title}</h4>
                </div>
                <div className="session-meta">
                  <span>
                    {format(new Date(s.scheduledAt), "PPp")}
                  </span>
                  <span>
                    <Users size={14} /> {s._count.attendances} attended
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="no-sessions">
          <Video size={48} />
          <h3>No Live Sessions Yet</h3>
          <p>
            {isTrainer
              ? "Schedule a live class or go live instantly to start teaching."
              : "No live classes have been scheduled for this course yet."}
          </p>
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Live Class</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="schedule-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. Module 3 — Live Q&A Session"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="What will this session cover?"
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledAt: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <select
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <Calendar size={16} />
                  )}
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
