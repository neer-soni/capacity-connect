import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

function getResourceType(mimeType: string): "video" | "pdf" | "slide" {
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return "video";
  if (
    mimeType.includes("presentation") ||
    mimeType.includes("powerpoint")
  ) return "slide";
  return "pdf";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * POST /api/upload/complete
 * Saves file metadata to DB after client-side direct upload completes.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const body = await request.json();
    const { title, courseId, publicUrl, storageKey, mimeType, sizeBytes = 0, purpose = "resource" } = body;

    if (!publicUrl || !storageKey) {
      return NextResponse.json({ error: "publicUrl and storageKey are required" }, { status: 400 });
    }

    if (purpose === "resource") {
      if (!["trainer", "admin"].includes(userRole)) {
        return NextResponse.json({ error: "Only trainers can add course resources." }, { status: 403 });
      }
      if (!courseId) {
        return NextResponse.json({ error: "courseId is required for resource uploads." }, { status: 400 });
      }

      if (userRole === "trainer") {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course || course.trainerId !== session.user.id) {
          return NextResponse.json({ error: "You do not own this course." }, { status: 403 });
        }
      }

      const resourceType = getResourceType(mimeType || "application/octet-stream");
      const cleanTitle = (title || "Uploaded Resource").replace(/\.[^.]+$/, "");

      const resource = await prisma.resource.create({
        data: {
          courseId,
          type: resourceType,
          title: cleanTitle,
          url: publicUrl,
          storageKey,
          mimeType: mimeType || "application/octet-stream",
          size: formatBytes(sizeBytes),
          sizeBytes: sizeBytes,
          uploadedBy: session.user.id!,
        },
      });

      return NextResponse.json({ success: true, resource, url: publicUrl }, { status: 201 });
    }

    return NextResponse.json({ success: true, url: publicUrl, storageKey }, { status: 201 });
  } catch (error) {
    console.error("Complete upload error:", error);
    return NextResponse.json({ error: "Failed to save file metadata." }, { status: 500 });
  }
}
