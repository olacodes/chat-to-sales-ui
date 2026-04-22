'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppIcon } from '@/components/ui/AppIcon';

// ─── Features Strip ───────────────────────────────────────────────────────────

const FEATURES = [
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
    desc: 'Manage WhatsApp, Instagram DMs, and TikTok messages from a single dashboard. Never miss a customer conversation again.',
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
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
    accentColor: 'var(--ds-accent-bg)',
    accentSoft: 'var(--ds-accent-bg-soft)',
    accentBorder: 'color-mix(in srgb, var(--ds-accent-bg) 30%, transparent)',
    title: 'Instant Order Capture',
    desc: 'Convert chat messages into structured orders in one click. Track status, payment, and fulfilment without leaving the conversation.',
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
    accentSoft: 'rgba(245,158,11,0.1)',
    accentBorder: 'rgba(245,158,11,0.25)',
    title: 'Revenue Pipeline',
    desc: 'See every deal at a glance. Track conversation-to-order conversion rates and identify your highest-value channels.',
  },
] as const;

export function FeaturesStrip() {
  return (
    <section className="relative py-24" style={{ backgroundColor: 'var(--ds-bg-surface)' }}>
      {/* Top border glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--ds-brand-border), transparent)',
        }}
      />

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
            Why ChatToSales
          </p>
          <h2
            className="text-4xl font-bold tracking-tight"
            style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
          >
            Everything your commerce needs
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative rounded-2xl p-7 group transition-all duration-300"
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
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{
                  backgroundColor: f.accentSoft,
                  border: `1px solid ${f.accentBorder}`,
                  color: f.accentColor,
                }}
              >
                {f.icon}
              </div>

              <h3
                className="text-lg font-semibold mb-3"
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const STATS = [
  { value: '5×', label: 'Faster order processing' },
  { value: '3 min', label: 'Average setup time' },
  { value: '500+', label: 'Active merchants' },
  { value: '99.9%', label: 'Uptime SLA' },
] as const;

export function StatsBar() {
  return (
    <section
      className="py-16 border-y"
      style={{ backgroundColor: 'var(--ds-bg-base)', borderColor: 'var(--ds-border-base)' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="flex flex-col gap-1"
            >
              <span
                className="text-4xl font-bold tracking-tight"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  background: 'linear-gradient(90deg, var(--ds-brand-bg), var(--ds-accent-bg))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {s.value}
              </span>
              <span
                className="text-sm"
                style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
              >
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Logo Bar ─────────────────────────────────────────────────────────────────

const COMPANY_LOGOS = [
  { name: 'Konga', initials: 'KO' },
  { name: 'Bumia', initials: 'BM' },
  { name: 'Flutterwave', initials: 'FW' },
  { name: 'Paystack', initials: 'PS' },
  { name: 'Sendbox', initials: 'SB' },
  { name: 'Termii', initials: 'TM' },
] as const;

export function LogoBar() {
  return (
    <section className="py-16" style={{ backgroundColor: 'var(--ds-bg-surface)' }}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm mb-10"
          style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
        >
          Trusted by teams at
        </motion.p>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {COMPANY_LOGOS.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="flex items-center gap-2.5 select-none cursor-default"
              style={{ opacity: 0.5 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
                style={{
                  backgroundColor: 'var(--ds-bg-elevated)',
                  border: '1px solid var(--ds-border-base)',
                  color: 'var(--ds-text-secondary)',
                }}
              >
                {logo.initials}
              </div>
              <span
                className="text-base font-semibold tracking-tight"
                style={{ color: 'var(--ds-text-secondary)', fontFamily: "'Sora', sans-serif" }}
              >
                {logo.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

export function CtaBanner() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: 'var(--ds-bg-base)' }}
    >
      {/* Glow blob */}
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
          Start selling via chat
          <br />
          in minutes
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-lg mb-10"
          style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
        >
          Connect your WhatsApp Business account and start converting chats into orders today. No
          credit card required.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
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
            Get started for free →
          </Link>
          <Link
            href="#"
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
            Talk to us
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  Product: [
    { label: 'Overview', href: '/product' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Changelog', href: '#' },
    { label: 'Roadmap', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'DPA', href: '#' },
  ],
} as const;

export function Footer() {
  return (
    <footer
      className="border-t py-16"
      style={{ backgroundColor: 'var(--ds-bg-base)', borderColor: 'var(--ds-border-base)' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-1.5 mb-4">
              <AppIcon size={32} />
              <span
                className="text-base font-bold"
                style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
              >
                ChatToSales
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
            >
              The platform that turns social commerce conversations into trackable revenue.
            </p>
          </div>

          {/* Link columns */}
          {(
            Object.entries(FOOTER_LINKS) as [string, readonly { label: string; href: string }[]][]
          ).map(([section, links]) => (
            <div key={section}>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
              >
                {section}
              </p>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-150"
                      style={{
                        color: 'var(--ds-text-tertiary)',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-text-primary)')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = 'var(--ds-text-tertiary)')
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t"
          style={{ borderColor: 'var(--ds-border-base)' }}
        >
          <p
            className="text-xs"
            style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
          >
            © {new Date().getFullYear()} ChatToSales. All rights reserved.
          </p>
          <div className="flex gap-4">
            {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-xs transition-colors duration-150"
                style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-text-secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ds-text-tertiary)')}
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
