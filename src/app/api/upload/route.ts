import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Allowed MIME types per category
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const MAX_VIDEO_SIZE = parseInt(process.env.UPLOAD_MAX_VIDEO_SIZE || "262144000");   // 250MB
const MAX_DOC_SIZE   = parseInt(process.env.UPLOAD_MAX_DOC_SIZE   || "52428800");    // 50MB
const MAX_IMAGE_SIZE = parseInt(process.env.UPLOAD_MAX_IMAGE_SIZE || "5242880");     // 5MB

function getMediaCategory(mimeType: string): "video" | "document" | "image" | null {
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return "video";
  if (ALLOWED_DOC_TYPES.includes(mimeType)) return "document";
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return "image";
  return null;
}

function getMaxSize(category: "video" | "document" | "image"): number {
  if (category === "video") return MAX_VIDEO_SIZE;
  if (category === "document") return MAX_DOC_SIZE;
  return MAX_IMAGE_SIZE;
}

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
 * POST /api/upload
 * Body: multipart/form-data with fields:
 *   - file: File (required)
 *   - courseId: string (required for course resources)
 *   - purpose: "resource" | "avatar" | "thumbnail" (default: "resource")
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const courseId = formData.get("courseId") as string | null;
    const purpose = (formData.get("purpose") as string) || "resource";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const mimeType = file.type;
    const category = getMediaCategory(mimeType);

    if (!category) {
      return NextResponse.json(
        { error: `Unsupported file type: ${mimeType}. Allowed: MP4, WebM, PDF, PPTX, DOCX, JPG, PNG, WebP.` },
        { status: 400 }
      );
    }

    const maxSize = getMaxSize(category);
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum allowed: ${formatBytes(maxSize)}. Your file: ${formatBytes(file.size)}.` },
        { status: 400 }
      );
    }

    // Only trainers and admins can upload course resources
    if (purpose === "resource") {
      if (!["trainer", "admin"].includes(userRole)) {
        return NextResponse.json({ error: "Only trainers can upload course resources." }, { status: 403 });
      }
      if (!courseId) {
        return NextResponse.json({ error: "courseId is required for resource uploads." }, { status: 400 });
      }

      // Verify the trainer owns the course (or is admin)
      if (userRole === "trainer") {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course || course.trainerId !== session.user.id) {
          return NextResponse.json({ error: "You do not own this course." }, { status: 403 });
        }
      }
    }

    // ── Save to local storage (dev) ───────────────────────────────
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique storage key
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageKey = `${timestamp}_${session.user.id}_${safeFileName}`;

    // Determine upload folder
    const subfolder = category === "video" ? "videos" : category === "image" ? "images" : "documents";
    const uploadDir = join(process.cwd(), "public", "uploads", subfolder);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, storageKey);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${subfolder}/${storageKey}`;

    // ── If it's a course resource, save to DB ─────────────────────
    if (purpose === "resource" && courseId) {
      const resourceType = getResourceType(mimeType);
      const resource = await prisma.resource.create({
        data: {
          courseId,
          type: resourceType,
          title: file.name.replace(/\.[^.]+$/, ""), // strip extension from title
          url: publicUrl,
          storageKey,
          mimeType,
          size: formatBytes(file.size),
          sizeBytes: file.size,
          uploadedBy: session.user.id!,
        },
      });
      return NextResponse.json({ success: true, resource, url: publicUrl }, { status: 201 });
    }

    // ── Avatar / Thumbnail upload — just return the URL ───────────
    return NextResponse.json({ success: true, url: publicUrl, storageKey }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}

/**
 * DELETE /api/upload?key=<storageKey>
 * Removes a previously uploaded file from storage and optionally from DB
 */
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storageKey = searchParams.get("key");
    const resourceId = searchParams.get("resourceId");

    if (!storageKey) {
      return NextResponse.json({ error: "storageKey is required" }, { status: 400 });
    }

    // Remove from DB if resourceId provided
    if (resourceId) {
      const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
      if (resource) {
        const course = await prisma.course.findUnique({ where: { id: resource.courseId } });
        const userRole = (session.user as any).role;
        if (userRole !== "admin" && course?.trainerId !== session.user.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        await prisma.resource.delete({ where: { id: resourceId } });
      }
    }

    // Remove file from disk
    const { unlink } = await import("fs/promises");
    const subfolders = ["videos", "documents", "images"];
    for (const sf of subfolders) {
      const filePath = join(process.cwd(), "public", "uploads", sf, storageKey);
      try {
        await unlink(filePath);
        break;
      } catch {
        // File not in this subfolder, try next
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete upload error:", error);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
