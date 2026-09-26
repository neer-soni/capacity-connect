import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/courses/[id] — Approve/reject course
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { action } = await request.json(); // approve | reject

    const course = await prisma.course.findUnique({
      where: { id },
      include: { trainer: true },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const newStatus = action === "approve" ? "published" : "draft";

    const updated = await prisma.course.update({
      where: { id },
      data: { status: newStatus },
    });

    // Notify trainer
    await prisma.notification.create({
      data: {
        userId: course.trainerId,
        type: "announcement",
        message:
          action === "approve"
            ? `Your course "${course.title}" has been approved and is now published!`
            : `Your course "${course.title}" has been sent back for revisions.`,
      },
    });

    // Audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id!,
        action: `${action}_course`,
        target: id,
        details: `Admin ${action}d course "${course.title}" by ${course.trainer.name}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH admin course error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
