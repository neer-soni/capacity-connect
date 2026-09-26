import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLiveKitToken } from "@/lib/livekit";

// POST /api/courses/[id]/live/[sessionId]/token — generate a LiveKit join token
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, sessionId } = await params;
    const userId = session.user.id;
    const userName = session.user.name || "Unknown";
    const userRole = (session.user as any).role;

    // Fetch the live session
    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        courseId: true,
        trainerId: true,
        roomId: true,
        status: true,
      },
    });

    if (!liveSession || liveSession.courseId !== courseId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Only allow joining live or scheduled sessions (trainer can join early to set up)
    const isTrainer = liveSession.trainerId === userId;

    if (liveSession.status === "ended" || liveSession.status === "cancelled") {
      return NextResponse.json(
        { error: "This session has ended" },
        { status: 400 }
      );
    }

    if (!isTrainer && liveSession.status !== "live") {
      return NextResponse.json(
        { error: "Session is not live yet" },
        { status: 400 }
      );
    }

    // Trainees must be enrolled in the course
    if (userRole === "trainee") {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });
      if (!enrollment) {
        return NextResponse.json(
          { error: "Not enrolled in this course" },
          { status: 403 }
        );
      }
    }

    // Generate LiveKit token
    const token = await createLiveKitToken(
      liveSession.roomId,
      userName,
      userId,
      isTrainer
    );

    // Record attendance (upsert — trainee may rejoin)
    if (!isTrainer) {
      await prisma.liveSessionAttendance.upsert({
        where: { sessionId_userId: { sessionId, userId } },
        create: { sessionId, userId },
        update: { joinedAt: new Date() },
      });
    }

    return NextResponse.json({
      token,
      roomId: liveSession.roomId,
      livekitUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL,
      isHost: isTrainer,
    });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
