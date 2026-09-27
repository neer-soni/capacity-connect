import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin, isSupabaseConfigured, STORAGE_BUCKET, SUPABASE_URL } from "@/lib/supabase";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const MAX_VIDEO_SIZE = parseInt(process.env.UPLOAD_MAX_VIDEO_SIZE || "262144000"); // 250MB
const MAX_DOC_SIZE   = parseInt(process.env.UPLOAD_MAX_DOC_SIZE   || "52428800");  // 50MB
const MAX_IMAGE_SIZE = parseInt(process.env.UPLOAD_MAX_IMAGE_SIZE || "5242880");   // 5MB

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

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * POST /api/upload/signed-url
 * Generates a signed upload URL for direct client-to-Supabase upload.
 * If Supabase is not configured, returns { useDirectUpload: false } so client falls back to local.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const body = await request.json();
    const { fileName, fileType, fileSize, courseId, purpose = "resource" } = body;

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "fileName and fileType required" }, { status: 400 });
    }

    const category = getMediaCategory(fileType);
    if (!category) {
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}. Allowed: MP4, WebM, PDF, PPTX, DOCX, JPG, PNG, WebP.` },
        { status: 400 }
      );
    }

    const maxSize = getMaxSize(category);
    if (fileSize && fileSize > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum allowed: ${formatBytes(maxSize)}.` },
        { status: 400 }
      );
    }

    if (purpose === "resource") {
      if (!["trainer", "admin"].includes(userRole)) {
        return NextResponse.json({ error: "Only trainers can upload course resources." }, { status: 403 });
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
    }

    // Check if Supabase Storage is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ useDirectUpload: false });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ useDirectUpload: false });
    }

    // Determine subfolder and file path
    const subfolder = category === "video" ? "videos" : category === "image" ? "images" : "documents";
    const timestamp = Date.now();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${subfolder}/${timestamp}_${session.user.id}_${safeFileName}`;

    // Ensure bucket exists (or use existing)
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === STORAGE_BUCKET);
      if (!bucketExists) {
        await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
      }
    } catch {
      // Ignore if list/create fails due to permissions; bucket might already exist
    }

    // Create signed upload URL
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      console.warn("Supabase signed upload URL generation failed:", error?.message);
      return NextResponse.json({ useDirectUpload: false, error: error?.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData?.publicUrl || `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;

    return NextResponse.json({
      useDirectUpload: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: storagePath,
      publicUrl,
      storageKey: storagePath,
    });
  } catch (error) {
    console.error("Error creating signed upload URL:", error);
    return NextResponse.json({ useDirectUpload: false, error: "Failed to create upload URL" }, { status: 500 });
  }
}
