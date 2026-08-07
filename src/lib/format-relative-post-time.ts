/**
 * Formats a post date as relative time: "just now", "1 min ago", "2 hours ago",
 * "3 days ago", "2 weeks ago", "5 months ago", "1 year ago", etc.
 */
export function formatRelativePostTime(
  value: string | Date | null | undefined
): string {
  if (value == null || value === "") return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" && value.trim() ? value.trim() : "—";
  }

  const now = Date.now();
  const diffMs = now - date.getTime();

  if (diffMs < 0) {
    // Future date — show absolute short date
    return date.toLocaleDateString();
  }

  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return "just now";

  const min = Math.floor(sec / 60);
  if (min < 60) return min === 1 ? "1 min ago" : `${min} mins ago`;

  const hour = Math.floor(min / 60);
  if (hour < 24) return hour === 1 ? "1 hour ago" : `${hour} hours ago`;

  const day = Math.floor(hour / 24);
  if (day < 7) return day === 1 ? "1 day ago" : `${day} days ago`;

  const week = Math.floor(day / 7);
  if (week < 5) return week === 1 ? "1 week ago" : `${week} weeks ago`;

  const month = Math.floor(day / 30);
  if (month < 12) return month === 1 ? "1 month ago" : `${month} months ago`;

  const year = Math.floor(day / 365);
  return year === 1 ? "1 year ago" : `${year} years ago`;
}
