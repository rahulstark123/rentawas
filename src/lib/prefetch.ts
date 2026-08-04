import { getQueryClient } from "@/lib/queryClient";
import { getActiveWorkspaceId } from "@/lib/workspace";

/**
 * Prefetch helper: Triggers TanStack Query prefetching on link hover.
 * When the user hovers over a menu item for even 100ms before clicking,
 * the data is already fetched or fetching in memory — achieving 0ms perceived latency
 * with 0 extra egress (since staleTime prevents duplicate calls if already cached).
 *
 * Note: chat "rooms" is intentionally omitted — rooms are lightweight, but
 * messages must load only when a conversation is opened.
 */
export function prefetchSection(section: "properties" | "tenants" | "maintenance" | "transactions" | "announcements" | "documents" | "billing") {
  const wid = getActiveWorkspaceId();
  if (!wid) return;
  const queryClient = getQueryClient();

  const prefetchMap: Record<string, { key: any[]; url: string }> = {
    properties: { key: ["properties", wid], url: `/api/properties?wid=${wid}` },
    tenants: { key: ["tenants", wid], url: `/api/tenants?workspaceId=${wid}` },
    maintenance: { key: ["maintenance", wid], url: `/api/maintenance?workspaceId=${wid}` },
    transactions: { key: ["transactions", wid], url: `/api/transactions?wid=${wid}` },
    announcements: { key: ["announcements", wid], url: `/api/announcements?workspaceId=${wid}` },
    documents: { key: ["documents", wid], url: `/api/documents?workspaceId=${wid}` },
    billing: { key: ["billing", wid], url: `/api/subscriptions?wid=${wid}` },
  };

  const item = prefetchMap[section];
  if (!item) return;

  queryClient.prefetchQuery({
    queryKey: item.key,
    queryFn: async () => {
      const res = await fetch(item.url);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || json.properties || json || [];
    },
  });
}
