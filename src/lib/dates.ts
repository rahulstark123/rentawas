/** Format a date in local timezone without UTC day-shift. */
export function formatLocalDate(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** User-facing date label; returns em dash when missing. */
export function formatDisplayDate(value: string | Date | null | undefined): string {
  const local = formatLocalDate(value);
  if (!local) return "—";
  const d = new Date(local);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
