"use client";
import { useState } from "react";
import { Flag, X, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export interface ReportTarget {
  contentType: "forum_thread" | "forum_reply";
  contentId: string;
  authorName: string;
  preview: string;
  courseTitle?: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ReportTarget | null;
  onReportSubmitted?: (contentId: string) => void;
}

const REPORT_REASONS = [
  "Inappropriate or offensive language",
  "Harassment, hate speech, or bullying",
  "Spam, advertisement, or repetitive text",
  "Misinformation or misleading content",
  "Off-topic or irrelevant discussion",
  "Other (please specify below)",
];

export default function ReportModal({
  isOpen,
  onClose,
  target,
  onReportSubmitted,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !target) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setError("Please select a reason for reporting");
      return;
    }

    setSubmitting(true);
    setError(null);

    const fullReason =
      selectedReason === "Other (please specify below)"
        ? details.trim() || "Other reason"
        : details.trim()
        ? `${selectedReason}: ${details.trim()}`
        : selectedReason;

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: target.contentType,
          contentId: target.contentId,
          reason: fullReason,
          reportedUser: target.authorName,
          courseContext: target.courseTitle || "",
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Response wasn't valid JSON
      }

      if (!res.ok) {
        throw new Error(data?.error || `Failed to submit report (Status: ${res.status})`);
      }

      setSubmitted(true);
      if (onReportSubmitted) {
        onReportSubmitted(target.contentId);
      }

      setTimeout(() => {
        setSubmitted(false);
        setSelectedReason(REPORT_REASONS[0]);
        setDetails("");
        onClose();
      }, 1600);
    } catch (err: any) {
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setError(null);
      setSubmitted(false);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
      onClick={handleClose}
    >
      <div
        className="card"
        style={{
          maxWidth: 480,
          width: "100%",
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          background: "white",
          padding: 0,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid hsl(214 20% 90%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "hsl(0 72% 96%)",
                color: "hsl(0 72% 51%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Flag size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "hsl(215 30% 12%)" }}>
                Report {target.contentType === "forum_thread" ? "Thread" : "Reply"}
              </h3>
              <p style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)", margin: 0 }}>
                Flag this message to the moderation team
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 6,
              color: "hsl(215 16% 57%)",
              borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Success View */}
        {submitted ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "hsl(145 63% 94%)",
                color: "hsl(145 63% 38%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <CheckCircle size={28} />
            </div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8, color: "hsl(215 30% 12%)" }}>
              Report Submitted
            </h4>
            <p style={{ fontSize: "0.85rem", color: "hsl(215 18% 38%)", maxWidth: 360, margin: "0 auto" }}>
              Thank you for keeping our learning community safe. Our moderation team has been notified and will review this content.
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
            {/* Target snippet */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 8,
                background: "hsl(214 20% 97%)",
                border: "1px solid hsl(214 20% 90%)",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 50%)", marginBottom: 4 }}>
                Reported Author: <strong style={{ color: "hsl(215 30% 15%)" }}>{target.authorName}</strong>
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "hsl(215 18% 30%)",
                  fontStyle: "italic",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                &ldquo;{target.preview}&rdquo;
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "hsl(0 72% 96%)",
                  color: "hsl(0 72% 40%)",
                  fontSize: "0.82rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <AlertTriangle size={15} />
                <span>{error}</span>
              </div>
            )}

            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "hsl(215 30% 15%)", marginBottom: 8 }}>
              Reason for reporting
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: selectedReason === reason ? "1px solid hsl(215 84% 52%)" : "1px solid hsl(214 20% 90%)",
                    background: selectedReason === reason ? "hsl(215 84% 97%)" : "white",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    style={{ accentColor: "hsl(215 84% 52%)" }}
                  />
                  <span style={{ color: selectedReason === reason ? "hsl(215 84% 30%)" : "hsl(215 18% 30%)", fontWeight: selectedReason === reason ? 600 : 400 }}>
                    {reason}
                  </span>
                </label>
              ))}
            </div>

            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "hsl(215 30% 15%)", marginBottom: 6 }}>
              Additional details (optional)
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="Provide any additional context for the moderators..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              style={{ width: "100%", resize: "vertical", marginBottom: 20, fontSize: "0.82rem" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-sm"
                disabled={submitting}
                style={{
                  background: "hsl(0 72% 51%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="spinner" /> Submitting...
                  </>
                ) : (
                  <>
                    <Flag size={14} /> Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
