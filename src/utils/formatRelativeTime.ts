/**
 * Format Relative Time Utility
 * Converts timestamps to human-readable relative time
 * Example: "2h ago", "3d ago", "just now"
 */

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - dateObj.getTime()) / 1000);

  // Just now (< 1 minute)
  if (seconds < 60) {
    return 'just now';
  }

  // Minutes ago (1-59 minutes)
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  // Hours ago (1-23 hours)
  const hours = Math.floor(seconds / 3600);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  // Days ago (1-6 days)
  const days = Math.floor(seconds / 86400);
  if (days < 7) {
    return `${days}d ago`;
  }

  // Weeks ago (1-3 weeks)
  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks}w ago`;
  }

  // Fallback to formatted date for older items
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Get days since a given date
 * Useful for lead health calculations
 */
export function getDaysSince(date: Date | string): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - dateObj.getTime()) / 1000);
  return Math.floor(seconds / 86400);
}

/**
 * Format duration in a human-readable way
 * Example: formatDuration(150) => "2m 30s"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}
