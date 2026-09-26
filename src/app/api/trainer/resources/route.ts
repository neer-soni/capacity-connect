import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/trainer/resources
 * Returns all resources uploaded by the authenticated trainer, across all their courses.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!["trainer", "admin"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all resources uploaded by this trainer
    const resources = await prisma.resource.findMany({
      where: { uploadedBy: session.user.id },
      include: {
        course: { select: { id: true, title: true } },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("GET trainer resources error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
