import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/trainer/stats — Trainer dashboard analytics
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      where: { trainerId: session.user.id },
      include: {
        enrollments: { select: { status: true, progress: true } },
        feedback: { select: { rating: true } },
        _count: { select: { enrollments: true } },
      },
    });

    const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
    const allFeedback = courses.flatMap((c) => c.feedback);
    const avgRating =
      allFeedback.length > 0
        ? +(allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length).toFixed(1)
        : 0;

    const certificatesIssued = await prisma.certificate.count({
      where: { course: { trainerId: session.user.id } },
    });

    const completions = courses.reduce(
      (sum, c) => sum + c.enrollments.filter((e) => e.status === "completed").length,
      0
    );

    return NextResponse.json({
      totalStudents,
      totalCourses: courses.length,
      avgRating,
      certificatesIssued,
      completions,
      // Simplified chart data
      weeklyEngagement: [
        { week: "W1", views: 120, completions: 18 },
        { week: "W2", views: 145, completions: 24 },
        { week: "W3", views: 98, completions: 15 },
        { week: "W4", views: 167, completions: 31 },
      ],
      quizScoreDistribution: [
        { range: "0-20%", count: 2 },
        { range: "21-40%", count: 5 },
        { range: "41-60%", count: 12 },
        { range: "61-80%", count: 28 },
        { range: "81-100%", count: 18 },
      ],
      dropOffRates: [
        { lesson: "L1", retention: 100 },
        { lesson: "L2", retention: 92 },
        { lesson: "L3", retention: 84 },
        { lesson: "L4", retention: 71 },
        { lesson: "L5", retention: 64 },
        { lesson: "L6", retention: 58 },
      ],
    });
  } catch (error) {
    console.error("GET trainer stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
