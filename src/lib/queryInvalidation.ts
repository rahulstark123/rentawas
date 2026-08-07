import type { QueryClient } from "@tanstack/react-query";

/** Invalidate shared landlord portfolio caches after mutations. */
export function invalidateLandlordPortfolio(queryClient: QueryClient, opts?: { propId?: string }) {
  queryClient.invalidateQueries({ queryKey: ["properties"] });
  queryClient.invalidateQueries({ queryKey: ["tenants"] });
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
  queryClient.invalidateQueries({ queryKey: ["rent-bills"] });
  queryClient.invalidateQueries({ queryKey: ["maintenance"] });
  queryClient.invalidateQueries({ queryKey: ["unit-detail"] });
  if (opts?.propId) {
    queryClient.invalidateQueries({ queryKey: ["property", opts.propId] });
  } else {
    queryClient.invalidateQueries({ queryKey: ["property"] });
  }
}

/** Maintenance tickets (dashboard + unit + tenant portals). */
export function invalidateMaintenance(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["maintenance"] });
  queryClient.invalidateQueries({ queryKey: ["tenant-me"] });
  queryClient.invalidateQueries({ queryKey: ["unit-detail"] });
}

/** Support desk tickets. */
export function invalidateSupportTickets(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["tickets"] });
}

/** AI Control Center usage + balance (and related billing receipts). */
export function invalidateAiUsage(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["ai-usage"] });
  queryClient.invalidateQueries({ queryKey: ["ai-billing-receipts"] });
}
