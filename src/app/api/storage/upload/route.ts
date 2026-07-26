/**
 * POST /api/storage/upload
 *
 * Accepts multipart/form-data with:
 *   - file: File (required)
 *   - workspaceId: string (required) — e.g., property/unit UUID or user ID
 *   - context: UploadContext (required) — e.g., "gov-id", "lease-docs", "profile"
 *   - filename: string (optional) — override filename
 *
 * Folder structure in R2:
 *   rentawas/{workspaceId}/{context}/{timestamp}_{sanitized-name}.{ext}
 *
 * All images (JPG, PNG, WEBP, HEIC) are compressed via Sharp before upload:
 *   - Converted to WebP for best compression + quality
 *   - Max width: 2048px (preserves aspect ratio)
 *   - Quality: 82 (visually lossless for documents)
 *
 * PDFs are uploaded as-is (no compression).
 *
 * Returns:
 *   { success: true, url: "https://...", key: "rentawas/..." }
 */

import { NextResponse } from "next/server";
import sharp from "sharp";
import { buildR2Key, uploadToR2, UploadContext } from "@/lib/r2";

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/tiff",
  "image/bmp",
];

const ALLOWED_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  "application/pdf",
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const workspaceId = (formData.get("workspaceId") as string | null)?.trim();
    const context = (formData.get("context") as UploadContext | null) || "misc";
    const overrideName = (formData.get("filename") as string | null)?.trim();

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    const originalName = overrideName || file.name || "upload";
    const fileSize = file.size;

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: `File type "${mimeType}" is not allowed. Accepted: images and PDF.` },
        { status: 415 }
      );
    }

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds 25MB limit (got ${(fileSize / 1024 / 1024).toFixed(1)}MB).` },
        { status: 413 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const baseName = originalName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_\-]/g, "_");

    let uploadBuffer: Buffer;
    let uploadContentType: string;
    let uploadFilename: string;

    if (IMAGE_MIME_TYPES.includes(mimeType)) {
      // Compress image using Sharp → WebP
      uploadBuffer = await sharp(rawBuffer)
        .rotate() // auto-orient from EXIF
        .resize({
          width: 2048,
          withoutEnlargement: true,
          fit: "inside",
        })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();

      uploadContentType = "image/webp";
      uploadFilename = `${timestamp}_${baseName}.webp`;
    } else {
      // PDF — upload as-is
      uploadBuffer = rawBuffer;
      uploadContentType = "application/pdf";
      uploadFilename = `${timestamp}_${baseName}.pdf`;
    }

    const key = buildR2Key(workspaceId, context, uploadFilename);
    const publicUrl = await uploadToR2(key, uploadBuffer, uploadContentType);

    const originalSizeKB = Math.round(fileSize / 1024);
    const uploadedSizeKB = Math.round(uploadBuffer.length / 1024);
    const compressionPct =
      fileSize > 0
        ? Math.round(((fileSize - uploadBuffer.length) / fileSize) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key,
      originalSizeKB,
      uploadedSizeKB,
      compressionPct: IMAGE_MIME_TYPES.includes(mimeType) ? compressionPct : 0,
      contentType: uploadContentType,
      filename: uploadFilename,
    });
  } catch (error: any) {
    console.error("POST /api/storage/upload error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: error?.message },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
