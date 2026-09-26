import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/courses/[id]/live — list all live sessions for a course
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, trainerId: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const userRole = (session.user as any).role;
    const userId = session.user.id;

    // Trainees must be enrolled
    if (userRole === "trainee") {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });
      if (!enrollment) {
        return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
      }
    }

    const sessions = await prisma.liveSession.findMany({
      where: { courseId },
      include: {
        trainer: { select: { id: true, name: true, avatar: true } },
        _count: { select: { attendances: true } },
      },
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching live sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch live sessions" },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/live — create (schedule) a new live session
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "trainer" && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: courseId } = await params;

    // Verify trainer owns this course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, trainerId: true, title: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.trainerId !== session.user.id && userRole !== "admin") {
      return NextResponse.json(
        { error: "You don't own this course" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, scheduledAt, duration } = body;

    if (!title || !scheduledAt) {
      return NextResponse.json(
        { error: "Title and scheduled time are required" },
        { status: 400 }
      );
    }

    // Generate a unique room ID
    const roomId = `cc-${courseId}-${Date.now()}`;

    const liveSession = await prisma.liveSession.create({
      data: {
        courseId,
        trainerId: session.user.id,
        title,
        description: description || "",
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60,
        roomId,
      },
      include: {
        trainer: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Notify enrolled trainees
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { userId: true },
    });

    if (enrollments.length > 0) {
      await prisma.notification.createMany({
        data: enrollments.map((e) => ({
          userId: e.userId,
          type: "live_class",
          message: `📹 Live class "${title}" scheduled for ${course.title}. ${new Date(scheduledAt).toLocaleString()}`,
        })),
      });
    }

    return NextResponse.json(liveSession, { status: 201 });
  } catch (error) {
    console.error("Error creating live session:", error);
    return NextResponse.json(
      { error: "Failed to create live session" },
      { status: 500 }
    );
  }
}
