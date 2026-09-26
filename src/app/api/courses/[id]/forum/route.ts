import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/courses/[id]/forum — List threads
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const threads = await prisma.forumThread.findMany({
      where: { courseId: id },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        replies: {
          include: {
            author: { select: { id: true, name: true, avatar: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(threads);
  } catch (error) {
    console.error("GET forum error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/courses/[id]/forum — Create thread
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
    const { title, body, isQuestion } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }

    const thread = await prisma.forumThread.create({
      data: {
        courseId: id,
        authorId: session.user.id,
        title,
        body,
        isQuestion: isQuestion || false,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error("POST forum error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/courses/[id]/forum — Accept an answer (trainer only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    const { threadId, acceptedReplyId } = await request.json();

    if (!threadId || !acceptedReplyId) {
      return NextResponse.json({ error: "threadId and acceptedReplyId are required" }, { status: 400 });
    }

    // Verify the course belongs to this trainer
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { trainerId: true },
    });

    if (!course || course.trainerId !== session.user.id) {
      return NextResponse.json({ error: "Only the course trainer can accept answers" }, { status: 403 });
    }

    // Verify the thread exists and is a question
    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      select: { courseId: true, isQuestion: true },
    });

    if (!thread || thread.courseId !== courseId) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    if (!thread.isQuestion) {
      return NextResponse.json({ error: "Only Q&A threads can have accepted answers" }, { status: 400 });
    }

    // Verify the reply exists and belongs to this thread
    const reply = await prisma.forumReply.findUnique({
      where: { id: acceptedReplyId },
      select: { threadId: true },
    });

    if (!reply || reply.threadId !== threadId) {
      return NextResponse.json({ error: "Reply not found in this thread" }, { status: 404 });
    }

    // Update the accepted reply
    const updated = await prisma.forumThread.update({
      where: { id: threadId },
      data: { acceptedReplyId },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH forum error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
