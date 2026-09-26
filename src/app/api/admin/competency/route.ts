import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/competency — List all trainers with their skills, ratings, and course counts
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const trainers = await prisma.user.findMany({
      where: { role: "trainer" },
      select: {
        id: true,
        name: true,
        skills: true,
        avatar: true,
        department: true,
        verified: true,
        courses: {
          select: {
            id: true,
            feedback: { select: { rating: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const result = trainers.map((t) => {
      let parsedSkills: string[] = [];
      try {
        parsedSkills = typeof t.skills === "string" ? JSON.parse(t.skills) : [];
      } catch {
        parsedSkills = t.skills ? t.skills.split(",").map((s) => s.trim()).filter(Boolean) : [];
      }

      const allFeedback = t.courses.flatMap((c) => c.feedback);
      const avgRating =
        allFeedback.length > 0
          ? +(allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length).toFixed(2)
          : 0;

      return {
        id: t.id,
        trainer: t.name,
        avatar: t.avatar,
        department: t.department,
        verified: t.verified,
        skills: parsedSkills,
        rating: avgRating,
        courses: t.courses.length,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET competency error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
