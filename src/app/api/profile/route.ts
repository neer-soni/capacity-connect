import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/profile — Fetch current user's profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: true,
        designation: true,
        skills: true,
        avatar: true,
        verified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let parsedSkills: string[] = [];
    try {
      parsedSkills = typeof user.skills === "string" ? JSON.parse(user.skills) : (user.skills || []);
    } catch {
      parsedSkills = user.skills ? user.skills.split(",").map((s) => s.trim()) : [];
    }

    return NextResponse.json({
      ...user,
      skills: parsedSkills,
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/profile — Update current user's profile
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, department, designation, skills, avatar, currentPassword, newPassword } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {
      name: name.trim(),
      department: (department || "").trim(),
      designation: (designation || "").trim(),
    };

    if (avatar !== undefined) {
      updateData.avatar = avatar.trim() || name.trim().slice(0, 2).toUpperCase();
    }

    if (skills !== undefined) {
      updateData.skills = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify([]);
    }

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long" },
          { status: 400 }
        );
      }

      const isValidPassword = await bcrypt.compare(currentPassword, existingUser.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Current password does not match" },
          { status: 400 }
        );
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: true,
        designation: true,
        skills: true,
        avatar: true,
        verified: true,
        createdAt: true,
      },
    });

    let parsedSkills: string[] = [];
    try {
      parsedSkills = typeof updated.skills === "string" ? JSON.parse(updated.skills) : (updated.skills || []);
    } catch {
      parsedSkills = updated.skills ? updated.skills.split(",").map((s) => s.trim()) : [];
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        ...updated,
        skills: parsedSkills,
      },
    });
  } catch (error) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
