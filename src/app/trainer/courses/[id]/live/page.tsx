"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LiveClassroom from "@/components/LiveClassroom";
import LiveSessionsList from "@/components/LiveSessionsList";
import "@/styles/live-classroom.css";
import {
  ArrowLeft,
  Video,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function TrainerLiveClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: courseId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [courseTitle, setCourseTitle] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSessionTitle, setActiveSessionTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourseTitle(data.title);
        }
      } catch (err) {
        console.error("Failed to fetch course:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleJoinSession = async (sessionId: string) => {
    // Fetch session details to get title
    try {
      const res = await fetch(`/api/courses/${courseId}/live/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveSessionTitle(data.title);
      }
    } catch {
      setActiveSessionTitle("Live Class");
    }
    setActiveSessionId(sessionId);
  };

  const handleLeave = () => {
    setActiveSessionId(null);
    router.refresh();
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 size={32} className="spinner" />
      </div>
    );
  }

  // If actively in a classroom session, show the LiveKit room
  if (activeSessionId) {
    return (
      <LiveClassroom
        courseId={courseId}
        sessionId={activeSessionId}
        sessionTitle={activeSessionTitle}
        courseTitle={courseTitle}
        isHost={true}
        onLeave={handleLeave}
      />
    );
  }

  // Otherwise show the session management list
  return (
    <div className="trainer-live-page">
      <div className="page-header">
        <Link href={`/trainer/courses/${courseId}`} className="back-link">
          <ArrowLeft size={18} /> Back to Course
        </Link>
        <div className="page-title-row">
          <Video size={24} />
          <div>
            <h1>Live Classroom</h1>
            <p className="subtitle">{courseTitle}</p>
          </div>
        </div>
      </div>

      <div className="page-body">
        <LiveSessionsList
          courseId={courseId}
          courseTitle={courseTitle}
          isTrainer={true}
          onJoinSession={handleJoinSession}
        />
      </div>

      <style jsx>{`
        .trainer-live-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px;
        }
        .page-header {
          margin-bottom: 32px;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 16px;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #fff;
        }
        .page-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .page-title-row h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }
        .subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 2px 0 0;
        }
        .page-body {
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
