"use client";

import { useEffect, useState } from "react";
import { ensureActiveWorkspaceId, getActiveWorkspaceId } from "@/lib/workspace";

/** Resolve active landlord workspace id once (shared across dashboard pages). */
export function useWorkspaceId() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const wid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!cancelled && wid) setWorkspaceId(wid);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return workspaceId;
}
