import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/courses/[id]/quiz — Get quiz for a course
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const assessment = await prisma.assessment.findFirst({
      where: { courseId: id },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: "No quiz found for this course" }, { status: 404 });
    }

    // Check if user has already attempted
    const existingAttempt = await prisma.attempt.findFirst({
      where: { assessmentId: assessment.id, userId: session.user.id },
      orderBy: { submittedAt: "desc" },
    });

    // Don't expose correct answers in the response
    const sanitized = {
      id: assessment.id,
      title: assessment.title,
      deadline: assessment.deadline,
      timeLimit: assessment.timeLimit,
      questions: assessment.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
      })),
      previousAttempt: existingAttempt
        ? {
            score: existingAttempt.score,
            total: existingAttempt.total,
            submittedAt: existingAttempt.submittedAt,
          }
        : null,
    };

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("GET quiz error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/courses/[id]/quiz — Submit quiz answers
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { answers } = await request.json(); // { questionId: selectedOptionId }

    const assessment = await prisma.assessment.findFirst({
      where: { courseId: id },
      include: {
        questions: { include: { options: true } },
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Grade the quiz
    let score = 0;
    const total = assessment.questions.length;

    for (const question of assessment.questions) {
      if (answers[question.id] === question.correctOptionId) {
        score++;
      }
    }

    // Save attempt
    const attempt = await prisma.attempt.create({
      data: {
        assessmentId: assessment.id,
        userId: session.user.id,
        score,
        total,
        answers: JSON.stringify(answers),
      },
    });

    // Update enrollment progress if passing (>= 60%)
    const percentage = Math.round((score / total) * 100);
    if (percentage >= 60) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: id } },
      });
      if (enrollment) {
        const newProgress = Math.max(enrollment.progress, 100); // 100% since they passed the assessment
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { 
            progress: newProgress,
            status: "completed",
            completedAt: enrollment.completedAt || new Date()
          },
        });
      }

      // Auto-issue a certificate if not already issued
      const existingCert = await prisma.certificate.findFirst({
        where: { userId: session.user.id, courseId: id },
      });

      if (!existingCert) {
        await prisma.certificate.create({
          data: {
            userId: session.user.id,
            courseId: id,
          },
        });

        await prisma.notification.create({
          data: {
            userId: session.user.id,
            type: "certificate",
            message: `Congratulations! You have completed the course and earned a certificate. It is now pending admin validation.`,
          },
        });
      }
    }

    // Build result with correct answers for review
    const result = {
      score,
      total,
      percentage,
      passed: percentage >= 60,
      questions: assessment.questions.map((q) => ({
        id: q.id,
        text: q.text,
        correctOptionId: q.correctOptionId,
        userAnswer: answers[q.id] || null,
        isCorrect: answers[q.id] === q.correctOptionId,
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST quiz error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
