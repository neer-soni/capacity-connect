import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/forum/[threadId]/reply — Post a reply
export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = await params;
    const { body, parentReplyId } = await request.json();

    if (!body) {
      return NextResponse.json({ error: "Body is required" }, { status: 400 });
    }

    const thread = await prisma.forumThread.findUnique({ where: { id: threadId } });
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const reply = await prisma.forumReply.create({
      data: {
        threadId,
        authorId: session.user.id,
        body,
        parentReplyId: parentReplyId || null,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    // Notify thread author
    if (thread.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: thread.authorId,
          type: "reply",
          message: `${session.user.name} replied to your thread "${thread.title}".`,
        },
      });
    }

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error("POST reply error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/forum/[threadId]/reply — Upvote
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { replyId, threadUpvote } = await request.json();

    if (threadUpvote) {
      const { threadId } = await params;
      const thread = await prisma.forumThread.update({
        where: { id: threadId },
        data: { upvotes: { increment: 1 } },
      });
      return NextResponse.json({ upvotes: thread.upvotes });
    }

    if (replyId) {
      const reply = await prisma.forumReply.update({
        where: { id: replyId },
        data: { upvotes: { increment: 1 } },
      });
      return NextResponse.json({ upvotes: reply.upvotes });
    }

    return NextResponse.json({ error: "replyId or threadUpvote required" }, { status: 400 });
  } catch (error) {
    console.error("PATCH vote error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
