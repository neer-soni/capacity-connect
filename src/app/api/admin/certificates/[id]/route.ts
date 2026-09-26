import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/certificates/[id] — Validate/reject certificate
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
    const { action } = await request.json(); // validate | reject

    const cert = await prisma.certificate.findUnique({
      where: { id },
      include: { course: true, user: true },
    });
    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    if (action === "validate") {
      await prisma.certificate.update({
        where: { id },
        data: { validatedByAdmin: true },
      });

      await prisma.notification.create({
        data: {
          userId: cert.userId,
          type: "certificate",
          message: `Your certificate for "${cert.course.title}" has been validated by admin!`,
        },
      });
    } else if (action === "reject") {
      await prisma.certificate.delete({ where: { id } });

      await prisma.notification.create({
        data: {
          userId: cert.userId,
          type: "certificate",
          message: `Your certificate for "${cert.course.title}" was not validated. Please contact admin for details.`,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id!,
        action: `${action}_certificate`,
        target: id,
        details: `Admin ${action}d certificate for ${cert.user.name} — ${cert.course.title}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH admin cert error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
