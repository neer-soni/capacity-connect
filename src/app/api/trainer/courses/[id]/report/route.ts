import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/trainer/courses/[id]/report — Per-trainee report for a course
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    const userRole = (session.user as any).role;

    // Verify access: trainer who owns the course, or admin
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, trainerId: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (userRole !== "admin" && course.trainerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all enrollments with user details
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: { select: { id: true, name: true, email: true, department: true, avatar: true } },
      },
      orderBy: { enrolledAt: "desc" },
    });

    // Get the assessment for this course
    const assessment = await prisma.assessment.findFirst({
      where: { courseId },
      select: { id: true, title: true },
    });

    // Get all attempts for this assessment (if exists)
    let attemptsByUser: Record<string, { score: number; total: number; submittedAt: Date }> = {};
    if (assessment) {
      const attempts = await prisma.attempt.findMany({
        where: { assessmentId: assessment.id },
        orderBy: { submittedAt: "desc" },
      });
      // Keep only the best attempt per user
      for (const attempt of attempts) {
        const existing = attemptsByUser[attempt.userId];
        const percentage = Math.round((attempt.score / attempt.total) * 100);
        const existingPercentage = existing
          ? Math.round((existing.score / existing.total) * 100)
          : 0;
        if (!existing || percentage > existingPercentage) {
          attemptsByUser[attempt.userId] = {
            score: attempt.score,
            total: attempt.total,
            submittedAt: attempt.submittedAt,
          };
        }
      }
    }

    // Get certificates for this course
    const certificates = await prisma.certificate.findMany({
      where: { courseId },
      select: { userId: true, validatedByAdmin: true },
    });
    const certByUser: Record<string, boolean> = {};
    for (const cert of certificates) {
      certByUser[cert.userId] = cert.validatedByAdmin;
    }

    // Build report
    const report = enrollments.map((e) => {
      const attempt = attemptsByUser[e.userId];
      const cert = certByUser[e.userId];

      return {
        userId: e.user.id,
        name: e.user.name,
        email: e.user.email,
        department: e.user.department,
        avatar: e.user.avatar,
        progress: e.progress,
        status: e.status,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
        quizScore: attempt
          ? `${Math.round((attempt.score / attempt.total) * 100)}%`
          : "Not attempted",
        quizRaw: attempt ? `${attempt.score}/${attempt.total}` : null,
        quizDate: attempt?.submittedAt || null,
        certificateStatus:
          cert === true
            ? "Validated"
            : cert === false
            ? "Pending"
            : "None",
      };
    });

    return NextResponse.json({
      course: { id: course.id, title: course.title },
      assessment: assessment ? { id: assessment.id, title: assessment.title } : null,
      trainees: report,
      summary: {
        totalEnrolled: enrollments.length,
        completed: enrollments.filter((e) => e.status === "completed").length,
        attempted: Object.keys(attemptsByUser).length,
        passed: Object.values(attemptsByUser).filter(
          (a) => Math.round((a.score / a.total) * 100) >= 60
        ).length,
        avgScore:
          Object.values(attemptsByUser).length > 0
            ? Math.round(
                Object.values(attemptsByUser).reduce(
                  (sum, a) => sum + Math.round((a.score / a.total) * 100),
                  0
                ) / Object.values(attemptsByUser).length
              )
            : 0,
      },
    });
  } catch (error) {
    console.error("GET course report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
