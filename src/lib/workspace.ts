// Helper utility to get active workspace ID dynamically from localStorage.
// Prefer ensureActiveWorkspaceId() on dashboard pages so wid is resolved from the logged-in owner.

export function getActiveWorkspaceId(): string {
  if (typeof window === "undefined") return "";
  const stored =
    localStorage.getItem("active_workspace_id") ||
    localStorage.getItem("rentawas_wid") ||
    localStorage.getItem("current_workspace_id");
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return String(parsed);
    }
  }
  return "";
}

export function setActiveWorkspaceId(wid: string | number): void {
  if (typeof window !== "undefined") {
    const widStr = String(wid);
    localStorage.setItem("active_workspace_id", widStr);
    localStorage.setItem("rentawas_wid", widStr);
    localStorage.setItem("current_workspace_id", widStr);
  }
}

/**
 * Resolve the logged-in owner's workspace wid from the server and persist it.
 * Always refreshes from auth so data stays scoped to the correct workspace (not a stale wid).
 */
export async function ensureActiveWorkspaceId(): Promise<string> {
  if (typeof window === "undefined") return "";

  try {
    const { supabase } = await import("@/lib/supabase");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return getActiveWorkspaceId();

    const params = new URLSearchParams();
    if (user.id) params.set("userId", user.id);
    else if (user.email) params.set("email", user.email);

    const res = await fetch(`/api/workspace/me?${params.toString()}`);
    if (!res.ok) return getActiveWorkspaceId();

    const json = await res.json();
    const wid = json?.data?.wid;
    if (wid != null && !isNaN(Number(wid)) && Number(wid) > 0) {
      setActiveWorkspaceId(wid);
      return String(wid);
    }
  } catch (err) {
    console.warn("ensureActiveWorkspaceId failed:", err);
  }

  return getActiveWorkspaceId();
}
