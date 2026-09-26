import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/courses/[id]/live/[sessionId] — get session details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, sessionId } = await params;

    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        trainer: { select: { id: true, name: true, avatar: true } },
        course: { select: { id: true, title: true, trainerId: true } },
        attendances: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        _count: { select: { attendances: true } },
      },
    });

    if (!liveSession || liveSession.courseId !== courseId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(liveSession);
  } catch (error) {
    console.error("Error fetching live session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[id]/live/[sessionId] — update session (start/end/cancel)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, sessionId } = await params;
    const body = await req.json();
    const { action } = body; // "start" | "end" | "cancel"

    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: { course: { select: { trainerId: true } } },
    });

    if (!liveSession || liveSession.courseId !== courseId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Only the trainer who owns the course can control the session
    if (liveSession.trainerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let updateData: any = {};

    switch (action) {
      case "start":
        if (liveSession.status !== "scheduled") {
          return NextResponse.json(
            { error: "Can only start a scheduled session" },
            { status: 400 }
          );
        }
        updateData = { status: "live", startedAt: new Date() };

        // Notify enrolled trainees that class is live
        const enrollments = await prisma.enrollment.findMany({
          where: { courseId },
          select: { userId: true },
        });
        if (enrollments.length > 0) {
          await prisma.notification.createMany({
            data: enrollments.map((e) => ({
              userId: e.userId,
              type: "live_class",
              message: `🔴 Live class "${liveSession.title}" is now LIVE! Join now.`,
            })),
          });
        }
        break;

      case "end":
        if (liveSession.status !== "live") {
          return NextResponse.json(
            { error: "Can only end a live session" },
            { status: 400 }
          );
        }
        updateData = { status: "ended", endedAt: new Date() };
        break;

      case "cancel":
        if (liveSession.status === "ended") {
          return NextResponse.json(
            { error: "Cannot cancel an ended session" },
            { status: 400 }
          );
        }
        updateData = { status: "cancelled" };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: start, end, cancel" },
          { status: 400 }
        );
    }

    const updated = await prisma.liveSession.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        trainer: { select: { id: true, name: true, avatar: true } },
        _count: { select: { attendances: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating live session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
