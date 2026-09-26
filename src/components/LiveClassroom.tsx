"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  GridLayout,
  ParticipantTile,
  useRoomContext,
  Chat,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track, RoomEvent } from "livekit-client";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  MessageSquare,
  Users,
  Hand,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface LiveClassroomProps {
  courseId: string;
  sessionId: string;
  sessionTitle: string;
  courseTitle: string;
  isHost: boolean;
  onLeave: () => void;
}

export default function LiveClassroom({
  courseId,
  sessionId,
  sessionTitle,
  courseTitle,
  isHost,
  onLeave,
}: LiveClassroomProps) {
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const fetchToken = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/courses/${courseId}/live/${sessionId}/token`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to join session");
        return;
      }

      setToken(data.token);
      setLivekitUrl(data.livekitUrl);
    } catch {
      setError("Failed to connect to live classroom");
    } finally {
      setLoading(false);
    }
  }, [courseId, sessionId]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const handleEndClass = async () => {
    try {
      await fetch(`/api/courses/${courseId}/live/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end" }),
      });
      onLeave();
    } catch {
      console.error("Failed to end class");
    }
  };

  if (loading) {
    return (
      <div className="live-classroom-loading">
        <Loader2 className="spinner" size={48} />
        <p>Connecting to live classroom...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="live-classroom-error">
        <AlertCircle size={48} />
        <h3>Cannot Join Session</h3>
        <p>{error}</p>
        <button onClick={onLeave} className="btn-back">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  if (!token || !livekitUrl) {
    return (
      <div className="live-classroom-error">
        <AlertCircle size={48} />
        <h3>Configuration Error</h3>
        <p>LiveKit is not configured. Please contact the administrator.</p>
        <button onClick={onLeave} className="btn-back">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="live-classroom-wrapper">
      {/* Header */}
      <div className="live-classroom-header">
        <div className="header-left">
          <span className="live-badge">🔴 LIVE</span>
          <div>
            <h2>{sessionTitle}</h2>
            <span className="course-label">{courseTitle}</span>
          </div>
        </div>
        <div className="header-right">
          {isHost && (
            <button onClick={handleEndClass} className="btn-end-class">
              <PhoneOff size={16} /> End Class for All
            </button>
          )}
          <button
            onClick={() => setShowChat(!showChat)}
            className="btn-toggle-chat"
          >
            <MessageSquare size={16} /> {showChat ? "Hide" : "Show"} Chat
          </button>
        </div>
      </div>

      {/* LiveKit Room */}
      <div className={`live-classroom-body ${showChat ? "with-chat" : ""}`}>
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={livekitUrl}
          onDisconnected={onLeave}
          data-lk-theme="default"
          style={{ height: "100%", width: "100%" }}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  );
}
