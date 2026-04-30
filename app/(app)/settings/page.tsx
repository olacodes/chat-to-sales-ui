'use client';

import { useEffect } from 'react';
import { WeeklyReportCard } from '@/components/reports/WeeklyReportCard';
import { TeamSection } from '@/components/settings/TeamSection';
import { ChannelsSection } from '@/components/settings/ChannelsSection';

export default function SettingsPage() {
  // Mark that the trader has visited settings — enables the WABA connect banner on dashboard
  useEffect(() => {
    try { localStorage.setItem('cts-visited-settings', '1'); } catch {}
  }, []);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
          Manage your workspace preferences.
        </p>
      </div>

      <section className="space-y-3">
        <h2
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--ds-text-tertiary)' }}
        >
          Channels
        </h2>
        <ChannelsSection />
      </section>

      <section className="space-y-3">
        <h2
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--ds-text-tertiary)' }}
        >
          Team
        </h2>
        <TeamSection />
      </section>

      <section className="space-y-3">
        <h2
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--ds-text-tertiary)' }}
        >
          Notifications
        </h2>
        <WeeklyReportCard />
      </section>
    </div>
  );
}
