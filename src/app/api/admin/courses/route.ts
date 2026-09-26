import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/courses — All courses for admin review
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      include: {
        trainer: { select: { id: true, name: true, avatar: true, department: true } },
        _count: { select: { enrollments: true, resources: true } },
        feedback: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      department: c.department,
      level: c.level,
      duration: c.duration,
      status: c.status,
      thumbnail: c.thumbnail,
      totalLessons: c.totalLessons,
      trainer: c.trainer.name,
      trainerAvatar: c.trainer.avatar,
      enrolledCount: c._count.enrollments,
      resourceCount: c._count.resources,
      rating:
        c.feedback.length > 0
          ? +(c.feedback.reduce((sum, f) => sum + f.rating, 0) / c.feedback.length).toFixed(1)
          : 0,
      createdAt: c.createdAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET admin courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}