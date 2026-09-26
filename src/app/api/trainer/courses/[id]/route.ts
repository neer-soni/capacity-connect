import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/trainer/courses/[id]
 * Trainer can update their own course details
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.trainerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, department, level, duration, tags, thumbnail, status } = body;

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(department !== undefined && { department }),
        ...(level !== undefined && { level }),
        ...(duration !== undefined && { duration }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT trainer course error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/trainer/courses/[id]/quiz is separate.
 * This route handles saving quiz via POST here for convenience.
 * Body: { title, timeLimit, deadline, questions: [{ text, options: [string], correctIndex: number }] }
 */
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

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.trainerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, timeLimit, deadline, questions } = await request.json();

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: "At least one question required" }, { status: 400 });
    }

    // Delete existing assessment for this course if any
    const existing = await prisma.assessment.findFirst({ where: { courseId: id } });
    if (existing) {
      await prisma.attempt.deleteMany({ where: { assessmentId: existing.id } });
      await prisma.question.findMany({ where: { assessmentId: existing.id } }).then(async (qs) => {
        for (const q of qs) {
          await prisma.option.deleteMany({ where: { questionId: q.id } });
        }
      });
      await prisma.question.deleteMany({ where: { assessmentId: existing.id } });
      await prisma.assessment.delete({ where: { id: existing.id } });
    }

    // Create new assessment
    const assessment = await prisma.assessment.create({
      data: {
        courseId: id,
        title: title || `${course.title} — Assessment`,
        timeLimit: timeLimit || 30,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    // Create questions + options
    for (const q of questions) {
      const question = await prisma.question.create({
        data: { assessmentId: assessment.id, text: q.text },
      });

      const options = await Promise.all(
        q.options.map((opt: string) =>
          prisma.option.create({ data: { questionId: question.id, text: opt } })
        )
      );

      // Set the correct option
      if (options[q.correctIndex]) {
        await prisma.question.update({
          where: { id: question.id },
          data: { correctOptionId: options[q.correctIndex].id },
        });
      }
    }

    return NextResponse.json({ success: true, assessmentId: assessment.id }, { status: 201 });
  } catch (error) {
    console.error("POST trainer quiz error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}