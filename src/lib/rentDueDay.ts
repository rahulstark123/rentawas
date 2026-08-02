/** Shared rent-due-day choices (onboarding + add-tenant modals): day 1–28. */

function ordinalDay(day: number): string {
  if (day === 1) return "1st";
  if (day === 2) return "2nd";
  if (day === 3) return "3rd";
  return `${day}th`;
}

export const RENT_DUE_DAY_OPTIONS: { value: number; label: string }[] = Array.from(
  { length: 28 },
  (_, i) => {
    const day = i + 1;
    return {
      value: day,
      label:
        day === 1
          ? "1st of Every Month (Standard)"
          : `${ordinalDay(day)} of Every Month`,
    };
  }
);

export function formatRentDueDayLabel(day: number): string {
  const match = RENT_DUE_DAY_OPTIONS.find((o) => o.value === day);
  if (match) return match.label;
  return `${ordinalDay(day)} of Every Month`;
}

/** Clamp due day to 1–28 (safe for all calendar months). */
export function normalizeRentDueDay(day: number | string | null | undefined): number {
  return Math.min(28, Math.max(1, parseInt(String(day ?? 1), 10) || 1));
}
