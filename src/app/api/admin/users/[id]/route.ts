import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/users/[id] — Approve/reject/suspend user
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
    const { action } = await request.json(); // approve | reject | suspend

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let newStatus: string;
    let message: string;

    switch (action) {
      case "approve":
        newStatus = "approved";
        message = `Your ${user.role} account has been approved! You can now access the platform.`;
        break;
      case "reject":
        newStatus = "suspended";
        message = `Your ${user.role} application has been reviewed and not approved at this time.`;
        break;
      case "suspend":
        newStatus = "suspended";
        message = `Your account has been suspended. Contact administration for details.`;
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update user
    const updated = await prisma.user.update({
      where: { id },
      data: {
        status: newStatus,
        verified: action === "approve" && user.role === "trainer",
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: id,
        type: "announcement",
        message,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id!,
        action: `${action}_user`,
        target: id,
        details: `Admin ${action}d user ${user.name} (${user.email})`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH admin user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
