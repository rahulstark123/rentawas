/**
 * Client-side file upload helper for Cloudflare R2.
 *
 * Sends file to POST /api/storage/upload which:
 *  - Compresses images to WebP via Sharp (server-side)
 *  - Compresses PDFs via pdf-lib + unpdf (PDF.js) + sharp
 *  - Stores in: rentawas/{workspaceId}/{context}/{timestamp}_{name}.{ext}
 *
 * Usage:
 *   const result = await uploadFile(file, { workspaceId: "prop_abc123", context: "gov-id" });
 *   if (result.success) console.log(result.url); // public CDN URL
 */

export type UploadContext =
  | "gov-id"
  | "lease-docs"
  | "profile"
  | "maintenance"
  | "property-images"
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
 * Compress image client-side via HTML5 canvas before uploading to server
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

export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    const { workspaceId, context, filename, onProgress, compress = true } = options;

    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error || "Invalid file" };
    }

    // Compress images client-side before sending over network
    let fileToUpload = file;
    if (compress && file.type.startsWith("image/")) {
      fileToUpload = await compressImageClientSide(file);
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("workspaceId", workspaceId);
    formData.append("context", context);
    if (filename) formData.append("filename", filename);

    // Use XMLHttpRequest to track upload progress
    return await new Promise<UploadResult>((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(Math.min(percent, 95)); // cap at 95% until server processes
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
      xhr.timeout = 60000; // 60 second timeout
      xhr.send(formData);
    });
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
