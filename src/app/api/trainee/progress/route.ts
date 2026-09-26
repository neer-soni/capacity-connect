import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/trainee/progress
 * Syncs video watch progress from the client player to the database.
 *
 * Body: {
 *   courseId: string;
 *   resourceId: string;
 *   watchedSeconds: number;    // total seconds watched for this session
 *   totalDurationSeconds: number; // total video duration in seconds
 * }
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, watchedSeconds, totalDurationSeconds } = body;

    if (!courseId || watchedSeconds === undefined) {
      return NextResponse.json({ error: "courseId and watchedSeconds are required" }, { status: 400 });
    }

    // Find the enrollment record
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id!, courseId } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    // Only update if the new watchedSeconds is greater (prevent going backward)
    const newWatchedSeconds = Math.max(enrollment.watchedSeconds, Math.floor(watchedSeconds));

    // Calculate progress percentage based on watched fraction vs total
    // We use a combination: base progress from watched seconds + bonus for manual completions
    let newProgress = enrollment.progress;

    if (totalDurationSeconds && totalDurationSeconds > 0) {
      // Calculate what % of video has been watched
      const watchedFraction = Math.min(1, newWatchedSeconds / totalDurationSeconds);
      // Map to 0-100 scale, but cap at 95% until explicitly completed
      const videoProgress = Math.round(watchedFraction * 95);
      newProgress = Math.max(enrollment.progress, videoProgress);
    }

    // Clamp to 0-100
    newProgress = Math.min(100, Math.max(0, newProgress));

    // Update enrollment
    const updatedEnrollment = await prisma.enrollment.update({
      where: { userId_courseId: { userId: session.user.id!, courseId } },
      data: {
        watchedSeconds: newWatchedSeconds,
        progress: newProgress,
        status: newProgress >= 100 ? "completed" : "in_progress",
        completedAt: newProgress >= 100 && !enrollment.completedAt ? new Date() : enrollment.completedAt,
      },
    });

    return NextResponse.json({
      progress: updatedEnrollment.progress,
      watchedSeconds: updatedEnrollment.watchedSeconds,
      status: updatedEnrollment.status,
    });
  } catch (error) {
    console.error("Progress sync error:", error);
    return NextResponse.json({ error: "Failed to sync progress" }, { status: 500 });
  }
}

/**
 * POST /api/trainee/progress
 * Marks a course as explicitly completed (sets progress to 100).
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id!, courseId } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { userId_courseId: { userId: session.user.id!, courseId } },
      data: {
        progress: 100,
        status: "completed",
        completedAt: enrollment.completedAt || new Date(),
      },
    });

    // Auto-issue a certificate if not already issued
    const existingCert = await prisma.certificate.findFirst({
      where: { userId: session.user.id!, courseId },
    });

    let certificate = null;
    if (!existingCert) {
      certificate = await prisma.certificate.create({
        data: {
          userId: session.user.id!,
          courseId,
        },
      });

      // Notify the trainee
      await prisma.notification.create({
        data: {
          userId: session.user.id!,
          type: "certificate",
          message: `Congratulations! You have completed the course and earned a certificate.`,
        },
      });
    }

    return NextResponse.json({
      progress: updatedEnrollment.progress,
      status: updatedEnrollment.status,
      certificate,
    });
  } catch (error) {
    console.error("Complete course error:", error);
    return NextResponse.json({ error: "Failed to complete course" }, { status: 500 });
  }
}
