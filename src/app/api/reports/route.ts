import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/reports — Submit a report for moderation (accessible to any authenticated user)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentType, contentId, reason, reportedUser, courseContext } = await request.json();

    if (!contentType || !contentId || !reason) {
      return NextResponse.json(
        { error: "contentType, contentId, and reason are required" },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        contentType,
        contentId,
        reportedBy: session.user.id,
        reportedUser: reportedUser || "",
        reason,
        courseContext: courseContext || "",
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
