import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/courses — List published courses (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";
    const department = searchParams.get("department") || "";

    const where: any = { status: "published" };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }
    if (level && level !== "All") {
      where.level = level;
    }
    if (department && department !== "All") {
      where.department = department;
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        trainer: { select: { id: true, name: true, avatar: true } },
        _count: { select: { enrollments: true } },
        feedback: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      trainerId: c.trainerId,
      trainer: c.trainer.name,
      trainerAvatar: c.trainer.avatar,
      department: c.department,
      tags: JSON.parse(c.tags),
      status: c.status,
      duration: c.duration,
      level: c.level,
      thumbnail: c.thumbnail,
      totalLessons: c.totalLessons,
      enrolledCount: c._count.enrollments,
      rating:
        c.feedback.length > 0
          ? +(c.feedback.reduce((sum, f) => sum + f.rating, 0) / c.feedback.length).toFixed(1)
          : 0,
      createdAt: c.createdAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
