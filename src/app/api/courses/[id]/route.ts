import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/courses/[id] — Single course detail (public)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        trainer: { select: { id: true, name: true, avatar: true, department: true, verified: true } },
        resources: true,
        _count: { select: { enrollments: true } },
        feedback: { select: { rating: true } },
        threads: {
          include: {
            author: { select: { name: true, avatar: true } },
            replies: { select: { id: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const result = {
      id: course.id,
      title: course.title,
      description: course.description,
      trainerId: course.trainerId,
      trainer: course.trainer.name,
      trainerAvatar: course.trainer.avatar,
      trainerDept: course.trainer.department,
      trainerVerified: course.trainer.verified,
      department: course.department,
      tags: JSON.parse(course.tags),
      status: course.status,
      duration: course.duration,
      level: course.level,
      thumbnail: course.thumbnail,
      totalLessons: course.totalLessons,
      enrolledCount: course._count.enrollments,
      rating:
        course.feedback.length > 0
          ? +(course.feedback.reduce((sum, f) => sum + f.rating, 0) / course.feedback.length).toFixed(1)
          : 0,
      resources: course.resources.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        url: r.url,
        storageKey: r.storageKey,
        mimeType: r.mimeType,
        size: r.size,
        sizeBytes: r.sizeBytes,
        duration: r.duration,
      })),
      threads: course.threads.map((t) => ({
        id: t.id,
        title: t.title,
        author: t.author.name,
        authorAvatar: t.author.avatar,
        isQuestion: t.isQuestion,
        upvotes: t.upvotes,
        replyCount: t.replies.length,
        acceptedReplyId: t.acceptedReplyId,
      })),
      createdAt: course.createdAt,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
