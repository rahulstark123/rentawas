/**
 * POST /api/storage/presign
 *
 * Returns a short-lived signed PUT URL so the client uploads directly to R2
 * (avoids shipping file bytes through Vercel).
 *
 * Body JSON:
 *   { workspaceId, context, filename, contentType, contentLength? }
 */

import { NextResponse } from "next/server";
import {
  buildR2Key,
  getR2PublicUrl,
  getSignedUploadUrl,
  isValidUploadContext,
  UploadContext,
} from "@/lib/r2";

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

const ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, "application/pdf"];
const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;
const MAX_PDF_SIZE_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workspaceId = String(body.workspaceId || "").trim();
    const contextRaw = String(body.context || "misc").trim();
    const originalName = String(body.filename || "upload").trim();
    const contentType = String(body.contentType || "application/octet-stream").trim();
    const contentLength = Number(body.contentLength || 0);

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    if (!isValidUploadContext(contextRaw)) {
      return NextResponse.json({ error: `Invalid context "${contextRaw}".` }, { status: 400 });
    }
    const context: UploadContext = contextRaw;

    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: `File type "${contentType}" is not allowed. Accepted: images and PDF.` },
        { status: 415 }
      );
    }

    const isPdf = contentType === "application/pdf";
    const maxBytes = isPdf ? MAX_PDF_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
    if (contentLength > 0 && contentLength > maxBytes) {
      return NextResponse.json(
        {
          error: isPdf
            ? `PDF exceeds 2MB limit.`
            : `File size exceeds 15MB limit.`,
        },
        { status: 413 }
      );
    }

    const timestamp = Date.now();
    const baseName = originalName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_\-]/g, "_");
    const ext = isPdf
      ? "pdf"
      : contentType === "image/webp"
        ? "webp"
        : contentType === "image/png"
          ? "png"
          : contentType === "image/jpeg"
            ? "jpg"
            : "bin";
    const uploadFilename = `${timestamp}_${baseName}.${ext}`;
    const key = buildR2Key(workspaceId, context, uploadFilename);
    const uploadUrl = await getSignedUploadUrl(key, contentType);
    const publicUrl = getR2PublicUrl(key);

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
      contentType,
      filename: uploadFilename,
      expiresIn: 600,
    });
  } catch (error: any) {
    console.error("POST /api/storage/presign error:", error);
    return NextResponse.json(
      { error: "Failed to create upload URL", details: error?.message },
      { status: 500 }
    );
  }
}
