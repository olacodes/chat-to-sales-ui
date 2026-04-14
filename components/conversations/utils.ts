/**
 * Shared time-formatting utility for the conversations UI.
 * Returns a short relative label: "2m", "1h", "Yesterday", or "Apr 1".
 */
export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const diff = now - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Full time for message bubbles: "10:32 AM" */
export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Initials from a full name: "Alice Johnson" → "AJ" */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
