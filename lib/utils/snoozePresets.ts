export interface SnoozePreset {
  label: string;
  sublabel: string;
  isoString: string;
}

/** Returns 3 context-aware snooze presets based on the current local time. */
export function getSnoozePresets(): SnoozePreset[] {
  const now = new Date();

  // In 2 hours
  const twoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // Tomorrow at 9am local time
  const tomorrow9am = new Date(now);
  tomorrow9am.setDate(tomorrow9am.getDate() + 1);
  tomorrow9am.setHours(9, 0, 0, 0);

  // Next week (7 days) at 9am local time
  const nextWeek9am = new Date(now);
  nextWeek9am.setDate(nextWeek9am.getDate() + 7);
  nextWeek9am.setHours(9, 0, 0, 0);

  const dayName = nextWeek9am.toLocaleDateString('en-US', { weekday: 'short' });

  return [
    {
      label: 'In 2 hours',
      sublabel: twoHours.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isoString: twoHours.toISOString(),
    },
    {
      label: 'Tomorrow',
      sublabel: 'at 9:00 AM',
      isoString: tomorrow9am.toISOString(),
    },
    {
      label: 'Next week',
      sublabel: `${dayName} at 9:00 AM`,
      isoString: nextWeek9am.toISOString(),
    },
  ];
}

/** Format a scheduled time for display in the chat bubble. */
export function formatScheduledTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (isToday) return `Today at ${time}`;
  if (isTomorrow) return `Tomorrow at ${time}`;
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ` at ${time}`;
}
