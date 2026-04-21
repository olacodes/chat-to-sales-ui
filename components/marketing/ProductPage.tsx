'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Sections';

// ─── Hero ─────────────────────────────────────────────────────────────────────

function ProductHero() {
  return (
    <section
      className="relative pt-40 pb-28 overflow-hidden"
      style={{ backgroundColor: 'var(--ds-bg-base)' }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 0%, var(--ds-brand-bg-soft) 0%, transparent 65%)',
        }}
      />
      {/* Bottom border glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--ds-brand-border), transparent)',
        }}
      />

      <div className="mx-auto max-w-4xl px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{
              backgroundColor: 'var(--ds-brand-bg-soft)',
              color: 'var(--ds-brand-text)',
              border: '1px solid var(--ds-brand-border)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
              style={{ backgroundColor: 'var(--ds-brand-bg)' }}
            ></span>{' '}
            Product overview
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55 }}
          className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
          style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
        >
          The complete sales OS
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, var(--ds-brand-bg), var(--ds-accent-bg))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            for chat commerce
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
        >
          Turn every WhatsApp, Instagram, and TikTok conversation into a confirmed order — with
          tools built for how African merchants actually sell.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
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
            Get started free →
          </Link>
          <Link
            href="#how-it-works"
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
            See how it works
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    step: '01',
    title: 'Connect your channels',
    desc: 'Link your WhatsApp Business number, Instagram, and TikTok accounts in under 3 minutes. No technical setup or developer needed.',
    accentColor: 'var(--ds-brand-bg)',
    accentSoft: 'var(--ds-brand-bg-soft)',
    accentBorder: 'var(--ds-brand-border)',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Chat and capture orders',
    desc: 'Every conversation is a sales opportunity. Convert messages into structured orders with one click, collect payment in the same thread.',
    accentColor: 'var(--ds-accent-bg)',
    accentSoft: 'var(--ds-accent-bg-soft)',
    accentBorder: 'color-mix(in srgb, var(--ds-accent-bg) 30%, transparent)',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72A7.97 7.97 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Track revenue and scale',
    desc: "See your full pipeline in one view. Identify top channels, track fulfilment rates, and confidently grow your team's capacity.",
    accentColor: '#10b981',
    accentSoft: 'rgba(16,185,129,0.10)',
    accentBorder: 'rgba(16,185,129,0.25)',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
] as const;

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 scroll-mt-20"
      style={{ backgroundColor: 'var(--ds-bg-surface)' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--ds-brand-text)', fontFamily: "'DM Sans', sans-serif" }}
          >
            How it works
          </p>
          <h2
            className="text-4xl font-bold tracking-tight"
            style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
          >
            Up and running in minutes
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line — desktop only */}
          <div
            className="hidden md:block absolute top-14 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px"
            style={{
              background:
                'linear-gradient(90deg, var(--ds-brand-border), var(--ds-accent-border, var(--ds-border-base)), transparent)',
            }}
          />

          {HOW_STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="flex flex-col items-start gap-5 relative"
            >
              {/* Step circle + icon */}
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: s.accentSoft,
                    border: `1px solid ${s.accentBorder}`,
                    color: s.accentColor,
                  }}
                >
                  {s.icon}
                </div>
                <span
                  className="text-4xl font-black tracking-tighter"
                  style={{
                    color: 'var(--ds-border-base)',
                    fontFamily: "'Sora', sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {s.step}
                </span>
              </div>

              <div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
                >
                  {s.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
                >
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feature Deep-Dives ───────────────────────────────────────────────────────

const DEEP_FEATURES = [
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72A7.97 7.97 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
    accentColor: 'var(--ds-brand-bg)',
    accentSoft: 'var(--ds-brand-bg-soft)',
    accentBorder: 'var(--ds-brand-border)',
    title: 'Unified Inbox',
    desc: 'All your customer conversations in one place — regardless of which channel they came from.',
    bullets: [
      'WhatsApp Business, Instagram DMs, TikTok in one view',
      'Filter by channel, agent, status, or date',
      'Assign and transfer conversations between agents',
      'See full customer history across every channel',
    ],
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
    accentColor: 'var(--ds-accent-bg)',
    accentSoft: 'var(--ds-accent-bg-soft)',
    accentBorder: 'color-mix(in srgb, var(--ds-accent-bg) 30%, transparent)',
    title: 'Instant Order Capture',
    desc: 'Convert chat messages into structured, trackable orders without leaving the conversation.',
    bullets: [
      'One-click order creation from any message',
      'Attach products, quantities, and delivery details',
      'Automatic order confirmation sent to customer',
      'Track status from pending → packed → delivered',
    ],
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    accentColor: '#f59e0b',
    accentSoft: 'rgba(245,158,11,0.10)',
    accentBorder: 'rgba(245,158,11,0.25)',
    title: 'Revenue Pipeline',
    desc: 'A real-time dashboard that shows every deal stage, from first message to paid order.',
    bullets: [
      'Conversion rate by channel and time period',
      'Revenue forecasting based on active conversations',
      'Identify your highest-value customers',
      'Export reports for accounting and tax purposes',
    ],
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    accentColor: '#8b5cf6',
    accentSoft: 'rgba(139,92,246,0.10)',
    accentBorder: 'rgba(139,92,246,0.25)',
    title: 'AI Smart Replies',
    desc: 'Let AI draft responses, answer FAQs, and suggest products — agents review and send.',
    bullets: [
      'Context-aware reply suggestions as you type',
      'Auto-answer common questions (hours, pricing, stock)',
      'Product recommendation engine based on chat history',
      'Handoff to human agent with full context preserved',
    ],
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
    accentColor: '#10b981',
    accentSoft: 'rgba(16,185,129,0.10)',
    accentBorder: 'rgba(16,185,129,0.25)',
    title: 'In-Chat Payments',
    desc: 'Send payment links and collect money without leaving the conversation thread.',
    bullets: [
      'Flutterwave and Paystack payment links in one tap',
      'Real-time payment confirmation inside the chat',
      'Support for bank transfer with auto-verification',
      'Automatic receipt generation and record keeping',
    ],
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    accentColor: '#ec4899',
    accentSoft: 'rgba(236,72,153,0.10)',
    accentBorder: 'rgba(236,72,153,0.25)',
    title: 'Team Collaboration',
    desc: 'Scale your sales team without losing the personal touch your customers expect.',
    bullets: [
      'Role-based access — admins, agents, supervisors',
      'Internal notes on conversations (invisible to customer)',
      'Agent performance analytics and response time tracking',
      'Team inbox with canned responses library',
    ],
  },
] as const;

function FeatureGrid() {
  return (
    <section className="py-24" style={{ backgroundColor: 'var(--ds-bg-base)' }}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--ds-brand-text)', fontFamily: "'DM Sans', sans-serif" }}
          >
            Features
          </p>
          <h2
            className="text-4xl font-bold tracking-tight"
            style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
          >
            Built for every part of the sale
          </h2>
          <p
            className="mt-4 text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
          >
            From the first message to the delivered package, ChatToSales covers the full journey.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEEP_FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}
              className="rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300"
              style={{
                backgroundColor: 'var(--ds-bg-elevated)',
                border: '1px solid var(--ds-border-base)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = f.accentBorder;
                e.currentTarget.style.boxShadow = 'var(--ds-shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--ds-border-base)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: f.accentSoft,
                  border: `1px solid ${f.accentBorder}`,
                  color: f.accentColor,
                }}
              >
                {f.icon}
              </div>

              {/* Title + desc */}
              <div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
                >
                  {f.desc}
                </p>
              </div>

              {/* Bullet list */}
              <ul className="flex flex-col gap-2">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span
                      className="mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px]"
                      style={{ backgroundColor: f.accentSoft, color: f.accentColor }}
                    >
                      ✓
                    </span>
                    <span
                      className="text-sm"
                      style={{
                        color: 'var(--ds-text-secondary)',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Integrations ─────────────────────────────────────────────────────────────

const CHANNEL_INTEGRATIONS = [
  {
    name: 'WhatsApp Business',
    initials: 'WA',
    color: '#25d366',
    soft: 'rgba(37,211,102,0.12)',
    border: 'rgba(37,211,102,0.25)',
  },
  {
    name: 'Instagram',
    initials: 'IG',
    color: '#e1306c',
    soft: 'rgba(225,48,108,0.12)',
    border: 'rgba(225,48,108,0.25)',
  },
  {
    name: 'TikTok',
    initials: 'TT',
    color: '#010101',
    soft: 'rgba(0,0,0,0.08)',
    border: 'rgba(0,0,0,0.15)',
  },
  {
    name: 'Facebook Messenger',
    initials: 'FM',
    color: '#0084ff',
    soft: 'rgba(0,132,255,0.12)',
    border: 'rgba(0,132,255,0.25)',
  },
] as const;

const PAYMENT_INTEGRATIONS = [
  {
    name: 'Flutterwave',
    initials: 'FW',
    color: '#f5a623',
    soft: 'rgba(245,166,35,0.12)',
    border: 'rgba(245,166,35,0.25)',
  },
  {
    name: 'Paystack',
    initials: 'PS',
    color: '#00c3f7',
    soft: 'rgba(0,195,247,0.12)',
    border: 'rgba(0,195,247,0.25)',
  },
  {
    name: 'Stripe',
    initials: 'ST',
    color: '#635bff',
    soft: 'rgba(99,91,255,0.12)',
    border: 'rgba(99,91,255,0.25)',
  },
  {
    name: 'Bank Transfer',
    initials: 'BT',
    color: '#10b981',
    soft: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.25)',
  },
] as const;

type Integration = { name: string; initials: string; color: string; soft: string; border: string };

function IntegrationChip({ item }: Readonly<{ item: Integration }>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-default"
      style={{
        backgroundColor: 'var(--ds-bg-elevated)',
        border: `1px solid var(--ds-border-base)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = item.border;
        e.currentTarget.style.boxShadow = 'var(--ds-shadow-sm)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--ds-border-base)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
        style={{
          backgroundColor: item.soft,
          border: `1px solid ${item.border}`,
          color: item.color,
        }}
      >
        {item.initials}
      </div>
      <span
        className="text-sm font-medium"
        style={{ color: 'var(--ds-text-primary)', fontFamily: "'DM Sans', sans-serif" }}
      >
        {item.name}
      </span>
    </motion.div>
  );
}

function Integrations() {
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
          className="text-center mb-16"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--ds-brand-text)', fontFamily: "'DM Sans', sans-serif" }}
          >
            Integrations
          </p>
          <h2
            className="text-4xl font-bold tracking-tight"
            style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
          >
            Works with the tools you already use
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Channels */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
            >
              Messaging channels
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CHANNEL_INTEGRATIONS.map((item) => (
                <IntegrationChip key={item.name} item={item} />
              ))}
            </div>
          </div>

          {/* Payments */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
            >
              Payment providers
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_INTEGRATIONS.map((item) => (
                <IntegrationChip key={item.name} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function ProductCta() {
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
          className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
          style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
        >
          Ready to sell smarter?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-lg mb-10"
          style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
        >
          Join 500+ merchants already using ChatToSales to convert conversations into revenue. Free
          to start, no credit card required.
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
            Start for free →
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
            View pricing
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Page assembly ────────────────────────────────────────────────────────────

export function ProductPageContent() {
  return (
    <div style={{ backgroundColor: 'var(--ds-bg-base)' }}>
      <Navbar />
      <main>
        <ProductHero />
        <HowItWorks />
        <FeatureGrid />
        <Integrations />
        <ProductCta />
      </main>
      <Footer />
    </div>
  );
}
