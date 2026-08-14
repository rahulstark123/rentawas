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
 * PDFs are compressed via open-source pdf-lib + unpdf (PDF.js) + sharp:
 *   - Structural optimize (object streams, strip metadata)
 *   - Recompress embedded page images when beneficial (scanned docs)
 *   - Max upload size: 2MB per PDF
 *
 * Returns:
 *   { success: true, url: "https://...", key: "rentawas/..." }
 */

import { NextResponse } from "next/server";
import sharp from "sharp";
import { buildR2Key, uploadToR2, UploadContext, isValidUploadContext } from "@/lib/r2";
import { compressPdfBuffer } from "@/lib/compressPdf";

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

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_PDF_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const workspaceId = (formData.get("workspaceId") as string | null)?.trim();
    const contextRaw = ((formData.get("context") as string | null) || "misc").trim();
    const overrideName = (formData.get("filename") as string | null)?.trim();

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    if (!isValidUploadContext(contextRaw)) {
      return NextResponse.json({ error: `Invalid context "${contextRaw}".` }, { status: 400 });
    }
    const context: UploadContext = contextRaw;

    const mimeType = file.type || "application/octet-stream";
    const originalName = overrideName || file.name || "upload";
    const fileSize = file.size;
    const isPdf = mimeType === "application/pdf";

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: `File type "${mimeType}" is not allowed. Accepted: images and PDF.` },
        { status: 415 }
      );
    }

    const maxBytes = isPdf ? MAX_PDF_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
    if (fileSize > maxBytes) {
      return NextResponse.json(
        {
          error: isPdf
            ? `PDF exceeds 2MB limit (got ${(fileSize / 1024 / 1024).toFixed(1)}MB). Please compress or upload a smaller file.`
            : `File size exceeds 15MB limit (got ${(fileSize / 1024 / 1024).toFixed(1)}MB).`,
        },
        { status: 413 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const baseName = originalName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_\-]/g, "_");

    let uploadBuffer: Buffer;
    let uploadContentType: string;
    let uploadFilename: string;
    let compressionPct = 0;

    if (IMAGE_MIME_TYPES.includes(mimeType)) {
      // Smart resolution scaling: 800px max width for profile avatars & payment QR codes, 2048px for general property images
      const targetMaxWidth = (context === "profile" || context === "payment-qr") ? 800 : 2048;

      // Compress image using Sharp → High-efficiency WebP format
      uploadBuffer = await sharp(rawBuffer)
        .rotate() // auto-orient EXIF orientation
        .resize({
          width: targetMaxWidth,
          withoutEnlargement: true,
          fit: "inside",
        })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();

      uploadContentType = "image/webp";
      uploadFilename = `${timestamp}_${baseName}.webp`;
      compressionPct =
        fileSize > 0
          ? Math.round(((fileSize - uploadBuffer.length) / fileSize) * 100)
          : 0;
    } else {
      // PDF — compress with pdf-lib + unpdf + sharp
      const pdfResult = await compressPdfBuffer(rawBuffer);
      uploadBuffer = pdfResult.buffer;
      uploadContentType = "application/pdf";
      uploadFilename = `${timestamp}_${baseName}.pdf`;
      compressionPct = pdfResult.compressionPct;
    }

    const key = buildR2Key(workspaceId, context, uploadFilename);
    const publicUrl = await uploadToR2(key, uploadBuffer, uploadContentType);

    const originalSizeKB = Math.round(fileSize / 1024);
    const uploadedSizeKB = Math.round(uploadBuffer.length / 1024);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key,
      originalSizeKB,
      uploadedSizeKB,
      compressionPct: Math.max(0, compressionPct),
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
