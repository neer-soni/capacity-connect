import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/trainee/enrollments — My enrolled courses
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            trainer: { select: { name: true, avatar: true } },
            feedback: { select: { rating: true } },
            _count: { select: { enrollments: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const result = enrollments.map((e) => ({
      id: e.id,
      courseId: e.courseId,
      progress: e.progress,
      watchedSeconds: e.watchedSeconds,
      status: e.status,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
      course: {
        id: e.course.id,
        title: e.course.title,
        description: e.course.description,
        trainer: e.course.trainer.name,
        thumbnail: e.course.thumbnail,
        duration: e.course.duration,
        level: e.course.level,
        department: e.course.department,
        totalLessons: e.course.totalLessons,
        enrolledCount: e.course._count.enrollments,
        rating:
          e.course.feedback.length > 0
            ? +(e.course.feedback.reduce((sum, f) => sum + f.rating, 0) / e.course.feedback.length).toFixed(1)
            : 0,
      },
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/trainee/enrollments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/trainee/enrollments — Enroll in a course
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    // Check course exists and is published
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.status !== "published") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check not already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "announcement",
        message: `You have been enrolled in "${course.title}".`,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("POST /api/trainee/enrollments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
