// ============================================================
// THULIR - Time Formatting Utility
// ============================================================
// Safe time parsing & formatting with full resilience against invalid dates.

import { formatDistanceToNow, isValid } from 'date-fns';

/**
 * Safely parse a date string or timestamp.
 * Returns null if invalid or missing.
 */
export function safeDate(dateStr: string | number | null | undefined): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isValid(d) ? d : null;
}

/**
 * Safely format distance to now (e.g. "5 minutes ago").
 * Never throws RangeError.
 */
export function formatTimeAgo(
  dateStr: string | number | null | undefined,
  fallback: string = 'Never'
): string {
  const d = safeDate(dateStr);
  if (!d) return fallback;

  try {
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return fallback;
  }
}
