import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/trainee/enrollments/[id] — Update progress
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { progress } = await request.json();

    const enrollment = await prisma.enrollment.findUnique({ where: { id } });
    if (!enrollment || enrollment.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updateData: any = { progress: Math.min(100, Math.max(0, progress)) };

    // Auto-complete at 100%
    if (progress >= 100 && enrollment.status !== "completed") {
      updateData.status = "completed";
      updateData.completedAt = new Date();

      // Generate certificate
      const existingCert = await prisma.certificate.findFirst({
        where: { userId: session.user.id, courseId: enrollment.courseId },
      });
      if (!existingCert) {
        const hashPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        await prisma.certificate.create({
          data: {
            userId: session.user.id,
            courseId: enrollment.courseId,
            hash: `CC2024-${hashPart}-${Date.now().toString(36).toUpperCase().slice(-4)}`,
          },
        });

        await prisma.notification.create({
          data: {
            userId: session.user.id,
            type: "certificate",
            message: "Congratulations! You've earned a new certificate. It is pending admin validation.",
          },
        });
      }
    }

    const updated = await prisma.enrollment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH enrollment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
