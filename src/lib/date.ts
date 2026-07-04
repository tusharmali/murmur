/** Local date helpers. All "date" keys are local YYYY-MM-DD. */

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

/** True for a well-formed local date key, e.g. "2026-07-04". */
export function isDateKey(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/**
 * Coerce any date representation back to a clean YYYY-MM-DD key.
 * Google Sheets can silently turn the stored "2026-07-04" string into a
 * date-typed cell, so a round-trip may return an ISO/locale string (or even a
 * serialized Date). We accept a valid key as-is, otherwise re-derive it from
 * the value, and finally fall back to the message timestamp.
 */
export function coerceDateKey(value: unknown, ts?: number): string {
  if (isDateKey(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return dateKey(d);
  }
  if (typeof ts === "number" && !isNaN(ts) && ts > 0) return dateKey(new Date(ts));
  return isDateKey(value) ? value : "";
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function prettyDate(key: string): string {
  if (!isDateKey(key)) {
    // Defensive: never render "Invalid Date" — best-effort or a calm fallback.
    const d = new Date(key);
    return isNaN(d.getTime())
      ? "Earlier"
      : d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  }
  const d = parseDateKey(key);
  const today = todayKey();
  const yest = dateKey(new Date(Date.now() - 86400000));
  if (key === today) return "Today";
  if (key === yest) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

/** Compact relative time for sync status, e.g. "just now", "3m ago", "2h ago". */
export function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function prettyTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
