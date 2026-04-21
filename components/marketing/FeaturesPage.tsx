'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Sections';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feature {
  icon: string;
  title: string;
  subtitle?: string;
  desc: string;
  insight: string;
  accentColor: string;
  accentSoft: string;
  accentBorder: string;
}

// ─── Core features ────────────────────────────────────────────────────────────

const CORE_FEATURES: Feature[] = [
  {
    icon: '◈',
    title: 'Smart Contact Profiles',
    desc: 'Every WhatsApp contact becomes a rich customer profile: name, phone, business type, location, total spend, order history, notes, and labels. Auto-populated from chat history using AI — no manual entry.',
    insight: 'Competitors show you a list of phone numbers. You see a customer with a full history.',
    accentColor: 'var(--ds-brand-bg)',
    accentSoft: 'var(--ds-brand-bg-soft)',
    accentBorder: 'var(--ds-brand-border)',
  },
  {
    icon: '◉',
    title: 'Visual Sales Pipeline',
    desc: 'Drag-and-drop kanban board: New Lead → Contacted → Quoted → Negotiating → Closed Won / Lost. Each card shows the customer name, deal value, last contact date, and a heat indicator (hot / warm / cold).',
    insight: 'No competitor built for the Nigerian market has a proper pipeline view. This alone justifies the subscription.',
    accentColor: '#f59e0b',
    accentSoft: 'rgba(245,158,11,0.10)',
    accentBorder: 'rgba(245,158,11,0.25)',
  },
  {
    icon: '◇',
    title: 'Follow-up Reminders',
    desc: 'Set a follow-up on any contact: "Remind me to check on Chioma on Friday at 3pm." The reminder arrives as a WhatsApp message with a one-tap link to open the chat and profile side by side.',
    insight: 'The moment it saves a missed sale, users never leave.',
    accentColor: '#8b5cf6',
    accentSoft: 'rgba(139,92,246,0.10)',
    accentBorder: 'rgba(139,92,246,0.25)',
  },
  {
    icon: '◐',
    title: 'Team Shared Inbox',
    desc: 'Multiple staff can reply to customers from one WhatsApp number simultaneously. Conversations are assigned to team members. No more passing a phone around the office. No more lost chats when staff leave.',
    insight: 'Every growing Nigerian business with more than 1 sales rep hits this wall. Solving it earns the Growth plan upgrade.',
    accentColor: '#ec4899',
    accentSoft: 'rgba(236,72,153,0.10)',
    accentBorder: 'rgba(236,72,153,0.25)',
  },
  {
    icon: '◫',
    title: 'Paystack Payment Links',
    desc: 'Generate a Paystack link inside the CRM and send it to any customer in one tap. When the customer pays, the deal automatically moves to "Closed Won" and revenue is logged. No manual reconciliation.',
    insight: 'No foreign CRM integrates with Paystack natively. This feature alone is worth the subscription price.',
    accentColor: '#10b981',
    accentSoft: 'rgba(16,185,129,0.10)',
    accentBorder: 'rgba(16,185,129,0.25)',
  },
  {
    icon: '◑',
    title: 'Weekly Business Report',
    desc: "Every Monday morning, the owner receives a WhatsApp message: new leads, deals closed, total revenue, top customers, deals needing attention. No login required — it arrives directly in WhatsApp.",
    insight: 'Most SME owners never open a dashboard. Delivering insight in WhatsApp means they actually see it.',
    accentColor: '#0ea5e9',
    accentSoft: 'rgba(14,165,233,0.10)',
    accentBorder: 'rgba(14,165,233,0.25)',
  },
];

// ─── Unfair advantage features ────────────────────────────────────────────────

interface UnfairFeature extends Feature {
  tag: string;
  tagColor: string;
  tagSoft: string;
}

const UNFAIR_FEATURES: UnfairFeature[] = [
  {
    icon: '◈',
    tag: 'AI',
    tagColor: '#8b5cf6',
    tagSoft: 'rgba(139,92,246,0.12)',
    title: 'AI Follow-up Writer',
    subtitle: 'Speaks Nigerian English',
    desc: 'Based on the last conversation, the AI suggests the perfect follow-up message — written in natural Nigerian English ("Oga, just checking in on that order..."). Tap Send. Done. No typing, no thinking.',
    insight: 'Foreign AI tools write robotic English. Ours writes how Nigerians actually talk. That cultural fit is a moat no overseas competitor can copy quickly.',
    accentColor: '#8b5cf6',
    accentSoft: 'rgba(139,92,246,0.10)',
    accentBorder: 'rgba(139,92,246,0.25)',
  },
  {
    icon: '◉',
    tag: 'AI',
    tagColor: '#8b5cf6',
    tagSoft: 'rgba(139,92,246,0.12)',
    title: 'Broadcast with Personalisation',
    subtitle: 'Not spam — smart targeting',
    desc: 'Send a message to a segment ("everyone who bought fabric in the last 3 months") with automatic personalisation ("Hi [Name], we just got new Ankara in..."). Each recipient gets a personal message, not a group blast. WhatsApp-compliant.',
    insight: 'Generic broadcast tools exist. We combine CRM segmentation + personalisation + WhatsApp compliance — a combination nobody in Nigeria has shipped.',
    accentColor: 'var(--ds-brand-bg)',
    accentSoft: 'var(--ds-brand-bg-soft)',
    accentBorder: 'var(--ds-brand-border)',
  },
  {
    icon: '◎',
    tag: 'AI',
    tagColor: '#8b5cf6',
    tagSoft: 'rgba(139,92,246,0.12)',
    title: 'Voice Note Transcription',
    subtitle: 'For customers who don\'t type',
    desc: "Many Nigerian customers send voice notes instead of text. ChatToSales automatically transcribes incoming voice notes, extracts key info (product interest, budget, location), and updates the customer profile — all without the owner doing anything.",
    insight: "This is the feature that makes Nigerian SME owners say \"this thing is magical.\" No competitor on the continent has built this.",
    accentColor: '#f59e0b',
    accentSoft: 'rgba(245,158,11,0.10)',
    accentBorder: 'rgba(245,158,11,0.25)',
  },
  {
    icon: '◇',
    tag: 'Naira-native',
    tagColor: '#10b981',
    tagSoft: 'rgba(16,185,129,0.12)',
    title: 'Naira-Native Dashboard',
    subtitle: 'Real revenue in real currency',
    desc: 'All revenue tracking is in Naira. No dollar conversion, no FX confusion. The dashboard shows: total revenue this month in ₦, average deal size in ₦, best-selling products in ₦. Paystack transactions auto-populate with confirmed amounts.',
    insight: 'Every foreign CRM shows revenue in USD or converts at weird rates. We speak the language of Nigerian business.',
    accentColor: '#10b981',
    accentSoft: 'rgba(16,185,129,0.10)',
    accentBorder: 'rgba(16,185,129,0.25)',
  },
  {
    icon: '◐',
    tag: 'Moat',
    tagColor: '#ec4899',
    tagSoft: 'rgba(236,72,153,0.12)',
    title: 'Offline Mode',
    subtitle: 'Works without internet',
    desc: 'The app works fully offline. Contact profiles, pipeline, and notes are cached locally. When the internet comes back, everything syncs. Power cuts and network drops neither erase your work nor block your sales rep.',
    insight: 'Every cloud-only competitor breaks during NEPA outages and poor 3G. We keep working. In Nigeria, reliability IS a feature.',
    accentColor: '#ec4899',
    accentSoft: 'rgba(236,72,153,0.10)',
    accentBorder: 'rgba(236,72,153,0.25)',
  },
  {
    icon: '◫',
    tag: 'Moat',
    tagColor: '#ec4899',
    tagSoft: 'rgba(236,72,153,0.12)',
    title: 'Debt & Credit Tracker',
    subtitle: 'Built for how Nigerians do business',
    desc: 'Nigerian SMEs sell on credit constantly. The CRM tracks who owes what, for how long, and auto-sends polite payment reminder messages on a schedule the owner sets. "Oga, just a reminder that ₦45,000 has been outstanding since last Tuesday."',
    insight: 'No CRM in the world has a credit/debt tracker designed for informal African commerce. This feature is invisible to foreign builders and obvious to us.',
    accentColor: '#0ea5e9',
    accentSoft: 'rgba(14,165,233,0.10)',
    accentBorder: 'rgba(14,165,233,0.25)',
  },
  {
    icon: '◑',
    tag: 'AI',
    tagColor: '#8b5cf6',
    tagSoft: 'rgba(139,92,246,0.12)',
    title: 'Customer Heat Scoring',
    subtitle: 'AI-powered lead prioritisation',
    desc: 'The AI scores every lead as Hot, Warm, or Cold based on recency of conversation, messages sent, payment history, and response speed. The dashboard surfaces "Your top 5 leads to contact today" every morning. No manual sorting required.',
    insight: 'A market trader with 200 contacts cannot prioritise manually. This saves hours and directly increases revenue.',
    accentColor: '#f59e0b',
    accentSoft: 'rgba(245,158,11,0.10)',
    accentBorder: 'rgba(245,158,11,0.25)',
  },
  {
    icon: '◈',
    tag: 'AI',
    tagColor: '#8b5cf6',
    tagSoft: 'rgba(139,92,246,0.12)',
    title: 'Smart Product Catalogue',
    subtitle: 'Shareable via WhatsApp',
    desc: 'Upload products once — photo, name, Naira price. When a customer asks "what do you have?", tap one button and a beautiful catalogue is shared as a WhatsApp message. No PDFs, no Instagram screenshots, no manual price lists.',
    insight: 'Once owners have built their catalogue, they will not rebuild it on another platform. Retention by design.',
    accentColor: 'var(--ds-brand-bg)',
    accentSoft: 'var(--ds-brand-bg-soft)',
    accentBorder: 'var(--ds-brand-border)',
  },
];

// ─── Shared components ────────────────────────────────────────────────────────

function InsightQuote({ text, accentColor }: Readonly<{ text: string; accentColor: string }>) {
  return (
    <div
      className="mt-auto pt-4 border-t flex gap-2.5 items-start"
      style={{ borderColor: 'var(--ds-border-base)' }}
    >
      <span
        className="mt-0.5 shrink-0 text-base leading-none"
        style={{ color: accentColor }}
        aria-hidden="true"
      >
        &#8220;
      </span>
      <p
        className="text-xs leading-relaxed italic"
        style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
      >
        {text}
      </p>
    </div>
  );
}

// ─── Core feature card ────────────────────────────────────────────────────────

function CoreCard({ feature, index }: Readonly<{ feature: Feature; index: number }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: (index % 3) * 0.09, duration: 0.48 }}
      className="flex flex-col gap-4 rounded-2xl p-6 transition-all duration-300"
      style={{
        backgroundColor: 'var(--ds-bg-elevated)',
        border: '1px solid var(--ds-border-base)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = feature.accentBorder;
        e.currentTarget.style.boxShadow = 'var(--ds-shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--ds-border-base)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{
          backgroundColor: feature.accentSoft,
          border: `1px solid ${feature.accentBorder}`,
          color: feature.accentColor,
        }}
      >
        {feature.icon}
      </div>

      {/* Title */}
      <h3
        className="text-lg font-semibold"
        style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
      >
        {feature.desc}
      </p>

      <InsightQuote text={feature.insight} accentColor={feature.accentColor} />
    </motion.div>
  );
}

// ─── Unfair advantage card ────────────────────────────────────────────────────

function UnfairCard({ feature, index }: Readonly<{ feature: UnfairFeature; index: number }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: (index % 2) * 0.1, duration: 0.48 }}
      className="flex gap-6 p-6 rounded-2xl transition-all duration-300"
      style={{
        backgroundColor: 'var(--ds-bg-elevated)',
        border: '1px solid var(--ds-border-base)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = feature.accentBorder;
        e.currentTarget.style.boxShadow = 'var(--ds-shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--ds-border-base)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Left: icon */}
      <div className="shrink-0 pt-0.5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
          style={{
            backgroundColor: feature.accentSoft,
            border: `1px solid ${feature.accentBorder}`,
            color: feature.accentColor,
          }}
        >
          {feature.icon}
        </div>
      </div>

      {/* Right: content */}
      <div className="flex flex-col gap-2 min-w-0">
        {/* Tag + Title row */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ backgroundColor: feature.tagSoft, color: feature.tagColor }}
          >
            {feature.tag}
          </span>
          <h3
            className="text-base font-semibold"
            style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
          >
            {feature.title}
          </h3>
        </div>

        {/* Subtitle */}
        {feature.subtitle && (
          <p
            className="text-xs font-medium"
            style={{ color: feature.accentColor, fontFamily: "'DM Sans', sans-serif" }}
          >
            {feature.subtitle}
          </p>
        )}

        {/* Description */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
        >
          {feature.desc}
        </p>

        {/* Insight */}
        <p
          className="text-xs leading-relaxed italic pt-1"
          style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
        >
          {feature.insight}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Core features section ────────────────────────────────────────────────────

function CoreSection() {
  return (
    <section
      className="py-24 border-t"
      style={{ backgroundColor: 'var(--ds-bg-surface)', borderColor: 'var(--ds-border-base)' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--ds-brand-bg-soft)',
                color: 'var(--ds-brand-text)',
                border: '1px solid var(--ds-brand-border)',
              }}
            >
              Core
            </span>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: 'var(--ds-border-base)' }}
            />
          </div>
          <h2
            className="text-4xl font-bold tracking-tight mt-4"
            style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
          >
            The foundation
          </h2>
          <p
            className="mt-3 text-lg max-w-2xl"
            style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
          >
            Everything a Nigerian merchant needs to run a professional sales operation from
            WhatsApp — on day one.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CORE_FEATURES.map((f, i) => (
            <CoreCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Unfair advantage section ─────────────────────────────────────────────────

function UnfairSection() {
  return (
    <section className="py-24" style={{ backgroundColor: 'var(--ds-bg-base)' }}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'rgba(139,92,246,0.12)',
                color: '#8b5cf6',
                border: '1px solid rgba(139,92,246,0.25)',
              }}
            >
              Unfair Advantages
            </span>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: 'var(--ds-border-base)' }}
            />
          </div>
          <h2
            className="text-4xl font-bold tracking-tight mt-4"
            style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
          >
            Features no one else built
          </h2>
          <p
            className="mt-3 text-lg max-w-2xl"
            style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
          >
            These are the capabilities that foreign tools missed — because they were never in the
            room when Nigerian merchants worked. We were.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {UNFAIR_FEATURES.map((f, i) => (
            <UnfairCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Comparison callout ───────────────────────────────────────────────────────

const COMPARISON_ROWS = [
  { feature: 'Nigerian English AI replies', us: true, them: false },
  { feature: 'Paystack-native payment links', us: true, them: false },
  { feature: 'Voice note transcription', us: true, them: false },
  { feature: 'Offline mode (NEPA-proof)', us: true, them: false },
  { feature: 'Debt & credit tracker', us: true, them: false },
  { feature: 'Naira revenue dashboard', us: true, them: false },
  { feature: 'WhatsApp-delivered reports', us: true, them: false },
  { feature: 'Pipeline kanban view', us: true, them: false },
] as const;

function ComparisonTable() {
  return (
    <section
      className="py-24 border-t"
      style={{ backgroundColor: 'var(--ds-bg-surface)', borderColor: 'var(--ds-border-base)' }}
    >
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            className="text-4xl font-bold tracking-tight"
            style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
          >
            Built for Nigeria.
            <br />
            Not retrofitted for it.
          </h2>
          <p
            className="mt-4 text-lg"
            style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
          >
            Every feature on this list exists because a Nigerian merchant asked for it.
          </p>
        </motion.div>

        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--ds-border-base)' }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-[1fr_auto_auto] px-5 py-3 text-xs font-bold uppercase tracking-widest"
            style={{
              backgroundColor: 'var(--ds-bg-elevated)',
              borderBottom: '1px solid var(--ds-border-base)',
              color: 'var(--ds-text-tertiary)',
            }}
          >
            <span>Feature</span>
            <span className="w-28 text-center" style={{ color: 'var(--ds-brand-text)' }}>
              ChatToSales
            </span>
            <span className="w-28 text-center">Others</span>
          </div>

          {COMPARISON_ROWS.map((row, i) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="grid grid-cols-[1fr_auto_auto] px-5 py-3.5 items-center"
              style={{
                borderBottom:
                  i < COMPARISON_ROWS.length - 1 ? '1px solid var(--ds-border-base)' : 'none',
                backgroundColor: i % 2 === 0 ? 'var(--ds-bg-base)' : 'var(--ds-bg-surface)',
              }}
            >
              <span
                className="text-sm"
                style={{ color: 'var(--ds-text-primary)', fontFamily: "'DM Sans', sans-serif" }}
              >
                {row.feature}
              </span>
              <span className="w-28 flex justify-center">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: 'var(--ds-brand-bg-soft)', color: 'var(--ds-brand-bg)' }}
                >
                  ✓
                </span>
              </span>
              <span className="w-28 flex justify-center">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{
                    backgroundColor: 'var(--ds-bg-sunken)',
                    color: 'var(--ds-text-tertiary)',
                  }}
                >
                  —
                </span>
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function FeaturesCta() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: 'var(--ds-bg-base)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 100%, var(--ds-brand-bg-soft) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--ds-brand-border), transparent)',
        }}
      />
      <div className="mx-auto max-w-3xl px-6 text-center relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-5 tracking-tight"
          style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
        >
          Every feature,
          <br />
          from day one.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-lg mb-9"
          style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
        >
          No feature-gating on the trial. See the full product, decide with full information.
          First 14 days are on us.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/signup"
            className="px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              backgroundColor: 'var(--ds-brand-bg)',
              color: 'white',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 32px color-mix(in srgb, var(--ds-brand-bg) 35%, transparent)',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg-hover)')
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg)')}
          >
            Start free trial →
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              border: '1px solid var(--ds-border-base)',
              color: 'var(--ds-text-secondary)',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--ds-border-strong)';
              e.currentTarget.style.color = 'var(--ds-text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--ds-border-base)';
              e.currentTarget.style.color = 'var(--ds-text-secondary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            See pricing
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Page hero ────────────────────────────────────────────────────────────────

function FeaturesHero() {
  return (
    <section
      className="relative pt-40 pb-20 overflow-hidden"
      style={{ backgroundColor: 'var(--ds-bg-base)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 0%, var(--ds-brand-bg-soft) 0%, transparent 65%)',
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--ds-brand-border), transparent)',
        }}
      />

      <div className="mx-auto max-w-4xl px-6 text-center relative">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--ds-brand-text)', fontFamily: "'DM Sans', sans-serif" }}
        >
          Features
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.55 }}
          className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
          style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
        >
          Everything you need.
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, var(--ds-brand-bg), var(--ds-accent-bg))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Nothing you don&apos;t.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
        >
          14 features purpose-built for Nigerian commerce — from a shared inbox that survives NEPA
          to AI that writes in Nigerian English.
        </motion.p>

        {/* Count pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.45 }}
          className="flex flex-wrap justify-center gap-3 mt-8"
        >
          {[
            { label: '6 Core features', color: 'var(--ds-brand-bg)', soft: 'var(--ds-brand-bg-soft)', border: 'var(--ds-brand-border)' },
            { label: '8 Unfair advantages', color: '#8b5cf6', soft: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.25)' },
          ].map((pill) => (
            <span
              key={pill.label}
              className="text-xs font-semibold px-4 py-1.5 rounded-full"
              style={{
                backgroundColor: pill.soft,
                color: pill.color,
                border: `1px solid ${pill.border}`,
              }}
            >
              {pill.label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Page assembly ────────────────────────────────────────────────────────────

export function FeaturesPageContent() {
  return (
    <div style={{ backgroundColor: 'var(--ds-bg-base)' }}>
      <Navbar />
      <main>
        <FeaturesHero />
        <CoreSection />
        <UnfairSection />
        <ComparisonTable />
        <FeaturesCta />
      </main>
      <Footer />
    </div>
  );
}
