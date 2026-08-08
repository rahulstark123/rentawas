/** Client-side plan gate — uses dashboard layout's window.checkCanAddAction. */
export function canPerformPlanAction(
  featureName: string,
  unitsToAdd?: number
): boolean {
  if (typeof window === "undefined") return true;
  const check = (window as unknown as { checkCanAddAction?: (f: string, u?: number) => boolean })
    .checkCanAddAction;
  if (!check) return true;
  return check(featureName, unitsToAdd);
}

export function canUseMessagesFeature(): boolean {
  if (typeof window === "undefined") return true;
  const check = (window as unknown as { checkCanUseMessages?: () => boolean }).checkCanUseMessages;
  if (!check) return true;
  return check();
}

/** Show API plan-quota error in toast when present. */
export function getPlanApiError(json: { error?: string; code?: string } | null | undefined): string | null {
  if (!json?.error) return null;
  if (
    json.code === "PLAN_LOCKED" ||
    json.code === "UNITS_CAP" ||
    json.code === "PROPERTIES_CAP" ||
    json.code === "MESSAGES_LOCKED"
  ) {
    return json.error;
  }
  return null;
}
