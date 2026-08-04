/**
 * Client-side file upload helper for Cloudflare R2.
 *
 * Prefer direct-to-R2 via presigned PUT (skips Vercel body egress).
 * Falls back to POST /api/storage/upload if direct upload fails (e.g. CORS).
 */

export type UploadContext =
  | "gov-id"
  | "lease-docs"
  | "profile"
  | "maintenance"
  | "property-images"
  | "property-listings"
  | "payment-qr"
  | "misc";

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  originalSizeKB?: number;
  uploadedSizeKB?: number;
  compressionPct?: number;
  filename?: string;
  error?: string;
}

export interface UploadOptions {
  /** Workspace-scoped folder ID (property UUID, unit UUID, user ID, etc.) */
  workspaceId: string;
  /** Sub-folder context inside the workspace */
  context: UploadContext;
  /** Optional override for the filename stored in R2 */
  filename?: string;
  /** Progress callback (0-100) */
  onProgress?: (percent: number) => void;
  /** Enable browser-side image compression before upload (defaults to true) */
  compress?: boolean;
}

/**
 * Compress image client-side via HTML5 canvas before uploading
 */
export async function compressImageClientSide(
  file: File,
  maxWidth = 1920,
  quality = 0.82
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
                type: "image/webp",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/webp",
          quality
        );
      } else {
        resolve(file);
      }
    };

    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

async function uploadViaProxy(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const { workspaceId, context, filename, onProgress } = options;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("workspaceId", workspaceId);
  formData.append("context", context);
  if (filename) formData.append("filename", filename);

  return await new Promise<UploadResult>((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(Math.min(percent, 95));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          onProgress?.(100);
          resolve({ success: true, ...data });
        } catch {
          resolve({ success: false, error: "Invalid server response" });
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          resolve({ success: false, error: err.error || "Upload failed" });
        } catch {
          resolve({ success: false, error: `HTTP ${xhr.status}` });
        }
      }
    };

    xhr.onerror = () => resolve({ success: false, error: "Network error during upload" });
    xhr.ontimeout = () => resolve({ success: false, error: "Upload timed out" });

    xhr.open("POST", "/api/storage/upload");
    xhr.timeout = 60000;
    xhr.send(formData);
  });
}

async function uploadDirectToR2(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const { workspaceId, context, filename, onProgress } = options;

  const presignRes = await fetch("/api/storage/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workspaceId,
      context,
      filename: filename || file.name,
      contentType: file.type || "application/octet-stream",
      contentLength: file.size,
    }),
  });

  if (!presignRes.ok) {
    const err = await presignRes.json().catch(() => ({}));
    throw new Error(err.error || `Presign failed (${presignRes.status})`);
  }

  const presign = await presignRes.json();
  if (!presign.uploadUrl || !presign.publicUrl) {
    throw new Error("Invalid presign response");
  }

  onProgress?.(10);

  const putRes = await new Promise<Response>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presign.uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.timeout = 60000;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = 10 + Math.round((event.loaded / event.total) * 85);
        onProgress(Math.min(percent, 95));
      }
    };

    xhr.onload = () => {
      resolve(new Response(null, { status: xhr.status, statusText: xhr.statusText }));
    };
    xhr.onerror = () => reject(new Error("Direct R2 upload network error"));
    xhr.ontimeout = () => reject(new Error("Direct R2 upload timed out"));
    xhr.send(file);
  });

  if (!putRes.ok) {
    throw new Error(`Direct R2 upload failed (HTTP ${putRes.status})`);
  }

  onProgress?.(100);
  return {
    success: true,
    url: presign.publicUrl,
    key: presign.key,
    filename: presign.filename,
    originalSizeKB: Math.round(file.size / 1024),
    uploadedSizeKB: Math.round(file.size / 1024),
    compressionPct: 0,
  };
}

export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    const { compress = true } = options;

    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error || "Invalid file" };
    }

    const isPdf = file.type === "application/pdf";

    // PDFs: always use the server proxy so pdf-lib / sharp compression still runs.
    // (Browser can't reliably recompress PDFs; direct R2 would store the raw file.)
    if (isPdf) {
      return await uploadViaProxy(file, options);
    }

    // Images: compress in the browser, then upload direct to R2 (skips Vercel body).
    let fileToUpload = file;
    if (compress && file.type.startsWith("image/")) {
      fileToUpload = await compressImageClientSide(file);
    }

    try {
      return await uploadDirectToR2(fileToUpload, options);
    } catch (directErr) {
      console.warn("Direct R2 upload failed, falling back to proxy:", directErr);
      // Proxy path re-compresses with Sharp — send original so we don't double-WebP poorly
      return await uploadViaProxy(file, options);
    }
  } catch (error: any) {
    return { success: false, error: error?.message || "Upload failed" };
  }
}

/**
 * Format bytes to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Max PDF upload size (before server-side compression). */
export const MAX_PDF_UPLOAD_MB = 2;
/** Max image upload size (before compression). */
export const MAX_IMAGE_UPLOAD_MB = 15;

/**
 * Validate file before uploading
 */
export function validateFile(
  file: File,
  options?: { maxSizeMB?: number; allowedTypes?: string[] }
): { valid: boolean; error?: string } {
  const isPdf = file.type === "application/pdf";
  const maxSizeMB =
    options?.maxSizeMB ?? (isPdf ? MAX_PDF_UPLOAD_MB : MAX_IMAGE_UPLOAD_MB);
  const allowedTypes = options?.allowedTypes ?? [
    "image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" not supported. Please upload an image or PDF.`,
    };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: isPdf
        ? `PDF too large (${formatFileSize(file.size)}). Max PDF size is ${maxSizeMB}MB.`
        : `File too large (${formatFileSize(file.size)}). Max size is ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
}
