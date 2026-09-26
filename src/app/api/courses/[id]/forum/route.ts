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
