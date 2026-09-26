import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/announcements — list announcements
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      include: { publisher: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return NextResponse.json(announcements);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/announcements — publish announcement + broadcast notifications
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, body, type } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }

    const iconMap: Record<string, string> = {
      announcement: "📢",
      achievement: "🏆",
      notification: "🔧",
      new_content: "📚",
    };

    // Create the announcement record
    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        type: type || "announcement",
        icon: iconMap[type] || "📢",
        publishedBy: session.user.id!,
      },
    });

    // Broadcast: create a notification for every non-admin user
    const users = await prisma.user.findMany({
      where: { role: { not: "admin" }, status: "approved" },
      select: { id: true },
    });

    if (users.length > 0) {
      await prisma.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          type: "announcement",
          message: `📢 ${title}: ${body.slice(0, 120)}${body.length > 120 ? "..." : ""}`,
        })),
      });
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("POST announcement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/announcements — delete an announcement
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE announcement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
