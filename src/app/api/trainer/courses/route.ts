import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/trainer/courses — Trainer's own courses
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      where: { trainerId: session.user.id },
      include: {
        _count: { select: { enrollments: true, resources: true, threads: true } },
        feedback: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      department: c.department,
      tags: JSON.parse(c.tags),
      status: c.status,
      duration: c.duration,
      level: c.level,
      thumbnail: c.thumbnail,
      totalLessons: c.totalLessons,
      enrolledCount: c._count.enrollments,
      resourceCount: c._count.resources,
      threadCount: c._count.threads,
      rating:
        c.feedback.length > 0
          ? +(c.feedback.reduce((sum, f) => sum + f.rating, 0) / c.feedback.length).toFixed(1)
          : 0,
      createdAt: c.createdAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET trainer courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/trainer/courses — Create new course
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, department, level, duration, tags, totalLessons, thumbnail } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description required" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        trainerId: session.user.id,
        department: department || "",
        level: level || "Beginner",
        duration: duration || "",
        tags: JSON.stringify(tags || []),
        totalLessons: totalLessons || 0,
        thumbnail: thumbnail || "📚",
        status: "draft",
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: "admin" } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: "announcement",
          message: `New course "${title}" submitted by ${session.user.name} for review.`,
        },
      });
    }

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("POST trainer course error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
