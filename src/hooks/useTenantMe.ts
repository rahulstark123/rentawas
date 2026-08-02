"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type TenantMe = Record<string, any>;

async function resolveTenantEmail(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

/**
 * Shared tenant profile query — layout + all tenant pages reuse one cache entry.
 * Avoids refetching /api/tenant/me on every navigation (staleTime from queryClient).
 */
export function useTenantMe() {
  return useQuery({
    queryKey: ["tenant-me"],
    queryFn: async (): Promise<TenantMe | null> => {
      const email = await resolveTenantEmail();
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/tenant/me${emailParam}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ?? null;
    },
  });
}

/** Workspace payment/settings for the tenant's landlord workspace. */
export function useTenantWorkspace(workspaceId: string | number | null | undefined) {
  const wid =
    workspaceId != null && !Number.isNaN(Number(workspaceId))
      ? String(workspaceId)
      : null;

  return useQuery({
    queryKey: ["workspace", wid],
    enabled: !!wid,
    queryFn: async () => {
      const res = await fetch(`/api/workspace?wid=${encodeURIComponent(wid!)}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ?? null;
    },
  });
}
