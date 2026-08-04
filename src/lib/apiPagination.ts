/**
 * Shared list pagination helpers for API routes.
 * Omitting page/limit → return full slim list (backward compatible).
 * Passing page/limit → server-side pagination.
 */

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

export interface PaginationParams {
  page: number;
  take: number | undefined;
  skip: number;
  /** When true, return the full (still slim) list — for dropdowns / search. */
  all: boolean;
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const hasPage = searchParams.has("page");
  const hasLimit = searchParams.has("limit");
  const allExplicit =
    searchParams.get("all") === "true" ||
    searchParams.get("limit") === "all" ||
    searchParams.get("limit") === "0";

  // No pagination params → full slim list (keeps existing UI working)
  if ((!hasPage && !hasLimit) || allExplicit) {
    return { page: 1, take: undefined, skip: 0, all: true };
  }

  const pageRaw = parseInt(searchParams.get("page") || "1", 10);
  const page = !isNaN(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const limitRaw = parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10);
  const take = !isNaN(limitRaw) && limitRaw > 0
    ? Math.min(limitRaw, MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  return {
    page,
    take,
    skip: (page - 1) * take,
    all: false,
  };
}

export function paginationMeta(
  total: number,
  params: PaginationParams,
  returned: number
) {
  if (params.all || params.take == null) {
    return {
      page: 1,
      limit: returned,
      total,
      totalPages: 1,
      hasMore: false,
    };
  }
  const totalPages = Math.max(1, Math.ceil(total / params.take));
  return {
    page: params.page,
    limit: params.take,
    total,
    totalPages,
    hasMore: params.page < totalPages,
  };
}

/** Reject base64 data-URLs so they never land in Postgres. */
export function isDataUrl(value: unknown): boolean {
  return typeof value === "string" && value.trimStart().toLowerCase().startsWith("data:");
}

export function rejectDataUrls(
  fields: Record<string, unknown>
): string | null {
  for (const [key, value] of Object.entries(fields)) {
    if (isDataUrl(value)) {
      return `${key} must be a storage URL, not a base64 data URL. Upload via /api/storage first.`;
    }
    if (Array.isArray(value) && value.some(isDataUrl)) {
      return `${key} contains base64 data URLs. Upload files to storage and pass URLs only.`;
    }
  }
  return null;
}

/** Strip oversized data-URL blobs from API responses (existing bad rows). */
export function scrubDataUrlField(value: string | null | undefined): string {
  if (!value) return "";
  if (isDataUrl(value)) return "";
  return value;
}
