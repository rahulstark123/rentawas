/** Resolve the landlord workspace for a tenant lease record. */
export function resolveTenantWorkspaceId(
  tenant: {
    workspaceId?: number | null;
    unit?: {
      workspaceId?: number | null;
      property?: { workspaceId?: number | null } | null;
    } | null;
    property?: { workspaceId?: number | null } | null;
  } | null | undefined
): number | null {
  if (!tenant) return null;
  const candidates = [
    tenant.workspaceId,
    tenant.unit?.workspaceId,
    tenant.unit?.property?.workspaceId,
    tenant.property?.workspaceId,
  ];
  for (const id of candidates) {
    if (id != null && !Number.isNaN(Number(id)) && Number(id) > 0) {
      return Number(id);
    }
  }
  return null;
}
