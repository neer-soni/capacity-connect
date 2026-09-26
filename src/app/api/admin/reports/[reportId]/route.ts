import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/reports/[reportId] — Dismiss or remove reported content
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { reportId } = await params;
    const { action } = await request.json();

    if (!action || !["dismiss", "remove"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'dismiss' or 'remove'" },
        { status: 400 }
      );
    }

    // Verify the report exists
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (action === "remove") {
      // Delete the reported content (thread or reply)
      if (report.contentType === "forum_thread") {
        await prisma.forumThread.delete({ where: { id: report.contentId } }).catch(() => {
          // Content may already be deleted
        });
      } else if (report.contentType === "forum_reply") {
        await prisma.forumReply.delete({ where: { id: report.contentId } }).catch(() => {
          // Content may already be deleted
        });
      }
    }

    // Update the report status
    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: action === "dismiss" ? "dismissed" : "resolved",
        resolvedAction: action === "dismiss" ? "Dismissed by admin" : "Content removed",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
