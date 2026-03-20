/** Shared date formatting utilities for the hydro module */

/** "YYYY/MM" */
export function formatYearMonth(d: Date): string {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** "YYYY-MM-DD HH:MM" */
export function formatTimestamp(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

/** "YYYY-MM-DD HH:MM:SS" */
export function formatDateTime(d: Date): string {
  return `${formatTimestamp(d)}:${String(d.getSeconds()).padStart(2, '0')}`;
}

/** "YYYYMM" (for filenames) */
export function formatYYYYMM(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}
