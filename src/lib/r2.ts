/**
 * Cloudflare R2 Storage Client (S3-compatible)
 *
 * Folder structure per upload:
 *   rentawas/{workspaceId}/{context}/{filename}
 *
 * Examples:
 *   rentawas/ws_abc123/gov-id/passport_scan.webp
 *   rentawas/ws_abc123/lease-docs/signed_lease.pdf
 *   rentawas/ws_abc123/profile/avatar.webp
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ENDPOINT = process.env.S3_ENDPOINT!;
const R2_REGION = process.env.S3_REGION || "auto";
const R2_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY!;
const R2_BUCKET = process.env.S3_BUCKET_NAME!;
const R2_PREFIX = process.env.S3_STORAGE_PREFIX || "rentawas";
const R2_PUBLIC_BASE = process.env.S3_PUBLIC_BASE_URL!;

export const r2Client = new S3Client({
  region: R2_REGION,
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

export type UploadContext =
  | "gov-id"
  | "lease-docs"
  | "profile"
  | "maintenance"
  | "property-images"
  | "misc";

/**
 * Build the R2 object key:
 * rentawas/{workspaceId}/{context}/{filename}
 */
export function buildR2Key(
  workspaceId: string,
  context: UploadContext,
  filename: string
): string {
  const safeFilename = filename.replace(/[^a-zA-Z0-9._\-]/g, "_");
  return `${R2_PREFIX}/${workspaceId}/${context}/${safeFilename}`;
}

/**
 * Upload a Buffer to R2 with proper content type.
 * Returns the public URL for the uploaded file.
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return `${R2_PUBLIC_BASE}/${key}`;
}

/**
 * Delete an object from R2 by key.
 */
export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    })
  );
}

/**
 * Generate a signed URL for temporary private access (24h).
 */
export async function getSignedDownloadUrl(key: string, expiresInSeconds = 86400): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Get the public URL for an already-uploaded R2 key.
 */
export function getR2PublicUrl(key: string): string {
  return `${R2_PUBLIC_BASE}/${key}`;
}
