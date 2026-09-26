import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const certificates = await prisma.certificate.findMany({
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
      orderBy: { issuedAt: "desc" },
    });

    const result = await Promise.all(
      certificates.map(async (cert) => {
        // Find latest attempt for this user on this course's assessment
        const attempt = await prisma.attempt.findFirst({
          where: {
            userId: cert.userId,
            assessment: { courseId: cert.courseId },
          },
          orderBy: { submittedAt: "desc" },
        });

        let scoreStr = "—";
        if (attempt && attempt.total > 0) {
          const percentage = Math.round((attempt.score / attempt.total) * 100);
          scoreStr = `${percentage}%`;
        }

        return {
          id: cert.id,
          user: cert.user.name,
          course: cert.course.title,
          hash: cert.hash,
          validatedByAdmin: cert.validatedByAdmin,
          issuedAt: cert.issuedAt,
          score: scoreStr,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET admin certificates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}