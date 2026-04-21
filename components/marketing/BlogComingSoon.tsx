'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Sections';

// Load Three.js scene only on the client
const BlogParticleScene = dynamic(() => import('./BlogParticleScene'), {
  ssr: false,
  loading: () => null,
});

// ─── Ticker items (stable keys for aria-hidden decorative ticker) ─────────────

const TICKER_ITEMS = [
  { id: 'wc', text: 'WhatsApp Commerce' },
  { id: 'sep1', text: '·' },
  { id: 'ns', text: 'Nigerian SMEs' },
  { id: 'sep2', text: '·' },
  { id: 'rg', text: 'Revenue Growth' },
  { id: 'sep3', text: '·' },
  { id: 'ai', text: 'AI for Sales' },
  { id: 'sep4', text: '·' },
  { id: 'cs', text: 'Case Studies' },
  { id: 'sep5', text: '·' },
  { id: 'mp', text: 'Merchant Playbooks' },
  { id: 'sep6', text: '·' },
  { id: 'pt', text: 'Product Tips' },
  { id: 'sep7', text: '·' },
] as const;

// ─── Topic pills ──────────────────────────────────────────────────────────────

const TOPICS = [
  {
    label: 'WhatsApp Commerce',
    color: '#25d366',
    soft: 'rgba(37,211,102,0.12)',
    border: 'rgba(37,211,102,0.25)',
  },
  {
    label: 'Sales Playbooks',
    color: 'var(--ds-brand-bg)',
    soft: 'var(--ds-brand-bg-soft)',
    border: 'var(--ds-brand-border)',
  },
  {
    label: 'Nigerian Market',
    color: '#f59e0b',
    soft: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    label: 'AI Tools',
    color: '#8b5cf6',
    soft: 'rgba(139,92,246,0.10)',
    border: 'rgba(139,92,246,0.25)',
  },
  {
    label: 'Case Studies',
    color: '#0ea5e9',
    soft: 'rgba(14,165,233,0.10)',
    border: 'rgba(14,165,233,0.25)',
  },
  {
    label: 'Product Updates',
    color: '#ec4899',
    soft: 'rgba(236,72,153,0.10)',
    border: 'rgba(236,72,153,0.25)',
  },
  {
    label: 'Merchant Stories',
    color: '#10b981',
    soft: 'rgba(16,185,129,0.10)',
    border: 'rgba(16,185,129,0.25)',
  },
  {
    label: 'Revenue Tips',
    color: '#f97316',
    soft: 'rgba(249,115,22,0.10)',
    border: 'rgba(249,115,22,0.25)',
  },
] as const;

// ─── Email form ───────────────────────────────────────────────────────────────

function NotifyForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-3 py-2"
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
          style={{
            backgroundColor: 'var(--ds-brand-bg-soft)',
            border: '1px solid var(--ds-brand-border)',
          }}
        >
          ✓
        </div>
        <p
          className="text-base font-semibold"
          style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
        >
          {"You're on the list!"}
        </p>
        <p
          className="text-sm"
          style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
        >
          {"We'll email you the moment the first post goes live."}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-md">
      <div
        className="flex flex-col sm:flex-row gap-2 p-1.5 rounded-2xl"
        style={{
          backgroundColor: 'var(--ds-bg-elevated)',
          border: `1px solid ${error ? 'var(--ds-danger-dot, #ef4444)' : 'var(--ds-border-base)'}`,
          boxShadow: 'var(--ds-shadow-md)',
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          placeholder="your@email.com"
          className="flex-1 bg-transparent text-sm px-3 py-2 outline-none min-w-0"
          style={{
            color: 'var(--ds-text-primary)',
            fontFamily: "'DM Sans', sans-serif",
          }}
          aria-label="Email address"
          autoComplete="email"
        />
        <button
          type="submit"
          className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap"
          style={{
            backgroundColor: 'var(--ds-brand-bg)',
            color: 'white',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 2px 16px color-mix(in srgb, var(--ds-brand-bg) 40%, transparent)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg)')}
        >
          Notify me →
        </button>
      </div>
      {error && (
        <p
          className="mt-1.5 text-xs px-1"
          style={{ color: 'var(--ds-danger-dot, #ef4444)', fontFamily: "'DM Sans', sans-serif" }}
        >
          {error}
        </p>
      )}
      <p
        className="mt-2.5 text-center text-xs"
        style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
      >
        No spam. Unsubscribe any time.
      </p>
    </form>
  );
}

// ─── Floating topic cloud ─────────────────────────────────────────────────────

function TopicCloud() {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 max-w-xl">
      {TOPICS.map((t, i) => (
        <motion.span
          key={t.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + i * 0.06, duration: 0.4 }}
          className="text-xs font-semibold px-3 py-1.5 rounded-full cursor-default select-none"
          style={{
            backgroundColor: t.soft,
            color: t.color,
            border: `1px solid ${t.border}`,
          }}
        >
          {t.label}
        </motion.span>
      ))}
    </div>
  );
}

// ─── Animated icon ────────────────────────────────────────────────────────────

function PenIcon() {
  return (
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
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

export function BlogComingSoonContent() {
  return (
    <div style={{ backgroundColor: 'var(--ds-bg-base)' }}>
      <Navbar />

      {/* Hero — full viewport height */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Three.js constellation in background */}
        <BlogParticleScene />

        {/* Gradient veil — top fade for navbar legibility, bottom fade into rest of page */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background: [
              'linear-gradient(to bottom, var(--ds-bg-base) 0%, transparent 18%, transparent 75%, var(--ds-bg-base) 100%)',
            ].join(','),
          }}
        />

        {/* Radial glow behind content */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 50%, var(--ds-brand-bg-soft) 0%, transparent 65%)',
          }}
        />

        {/* Foreground content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pt-32 pb-20 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-6"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{
                backgroundColor: 'var(--ds-brand-bg-soft)',
                color: 'var(--ds-brand-text)',
                border: '1px solid var(--ds-brand-border)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <PenIcon />
              Coming soon
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-5 leading-[1.05]"
            style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
          >
            The ChatToSales
            <br />
            <span
              style={{
                background:
                  'linear-gradient(135deg, var(--ds-brand-bg) 0%, #22c55e 40%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Blog
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg md:text-xl max-w-xl leading-relaxed mb-4"
            style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
          >
            Deep dives, field tactics, and honest stories from the frontline of Nigerian commerce.
            Written by merchants, for merchants.
          </motion.p>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.45 }}
            className="text-sm mb-10"
            style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
          >
            We&apos;re writing the first batch of posts right now. Leave your email and be the first
            to read them.
          </motion.p>

          {/* Email form */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36, duration: 0.48 }}
            className="w-full flex justify-center mb-14"
          >
            <NotifyForm />
          </motion.div>

          {/* Topic divider */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
          >
            Topics we&apos;ll cover
          </motion.p>

          <TopicCloud />
        </div>

        {/* Scrolling ticker — bottom of hero */}
        <div
          className="relative z-10 border-t overflow-hidden py-3"
          style={{
            borderColor: 'var(--ds-border-base)',
            backgroundColor: 'color-mix(in srgb, var(--ds-bg-surface) 80%, transparent)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
            className="flex items-center gap-16 whitespace-nowrap w-max"
            aria-hidden="true"
          >
            {(['copy-a', 'copy-b'] as const).map((copyKey) => (
              <span key={copyKey} className="flex items-center gap-16">
                {TICKER_ITEMS.map((item) => (
                  <span
                    key={`${copyKey}-${item.id}`}
                    className="text-xs font-medium"
                    style={{
                      color: item.text === '·' ? 'var(--ds-brand-bg)' : 'var(--ds-text-tertiary)',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {item.text}
                  </span>
                ))}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Teaser section ── "What to expect" ──────────────────────────────────── */}
      <section
        className="py-24 border-t"
        style={{ backgroundColor: 'var(--ds-bg-surface)', borderColor: 'var(--ds-border-base)' }}
      >
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
            >
              What we&apos;re writing
            </h2>
            <p
              className="mt-3 text-base"
              style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
            >
              A sneak peek at the first articles coming down the pipeline.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {TEASER_POSTS.map((post, i) => (
              <TeaserCard key={post.title} post={post} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA ────────────────────────────────────────────────────────────────── */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ backgroundColor: 'var(--ds-bg-base)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 55% 55% at 50% 100%, var(--ds-brand-bg-soft) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--ds-brand-border), transparent)',
          }}
        />
        <div className="mx-auto max-w-2xl px-6 text-center relative">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4 tracking-tight"
            style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
          >
            While you wait, start selling smarter.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="text-base mb-8"
            style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
          >
            The blog is coming. The product is already here.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
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
              href="/features"
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
              Explore features
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ─── Teaser post data + card ──────────────────────────────────────────────────

const TEASER_POSTS = [
  {
    tag: 'Sales Playbook',
    tagColor: 'var(--ds-brand-bg)',
    tagSoft: 'var(--ds-brand-bg-soft)',
    tagBorder: 'var(--ds-brand-border)',
    title: 'How a Lagos fashion vendor closed 40 orders in one WhatsApp thread',
    excerpt:
      'A step-by-step breakdown of the exact messages, follow-up timing, and payment flow that converted a broadcast into ₦380,000 in 72 hours.',
    readTime: '8 min read',
    icon: '👗',
  },
  {
    tag: 'AI Tools',
    tagColor: '#8b5cf6',
    tagSoft: 'rgba(139,92,246,0.10)',
    tagBorder: 'rgba(139,92,246,0.25)',
    title: "Why Nigerian English breaks every AI tool — and what we're doing about it",
    excerpt:
      'Foreign AI writes "Dear valued customer." Your customers respond to "Oga, the thing don arrive o." We explain why cultural fit is a hard product problem.',
    readTime: '6 min read',
    icon: '🤖',
  },
  {
    tag: 'Nigerian Market',
    tagColor: '#f59e0b',
    tagSoft: 'rgba(245,158,11,0.10)',
    tagBorder: 'rgba(245,158,11,0.25)',
    title:
      'The informal debt economy: why credit tracking is the most-requested CRM feature in Nigeria',
    excerpt:
      '"Pay me when you can" is not a bug in Nigerian commerce — it\'s the business model. Here\'s why no foreign CRM supports it and how we built one that does.',
    readTime: '10 min read',
    icon: '🤝',
  },
] as const;

interface TeaserPost {
  tag: string;
  tagColor: string;
  tagSoft: string;
  tagBorder: string;
  title: string;
  excerpt: string;
  readTime: string;
  icon: string;
}

function TeaserCard({ post, index }: Readonly<{ post: TeaserPost; index: number }>) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.1, duration: 0.48 }}
      className="flex flex-col gap-4 rounded-2xl p-6 transition-all duration-300"
      style={{
        backgroundColor: 'var(--ds-bg-elevated)',
        border: '1px solid var(--ds-border-base)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = post.tagBorder;
        e.currentTarget.style.boxShadow = 'var(--ds-shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--ds-border-base)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Emoji icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
        style={{
          backgroundColor: post.tagSoft,
          border: `1px solid ${post.tagBorder}`,
        }}
        aria-hidden="true"
      >
        {post.icon}
      </div>

      {/* Tag */}
      <span
        className="text-[10px] font-bold uppercase tracking-widest self-start px-2.5 py-0.5 rounded-full"
        style={{
          backgroundColor: post.tagSoft,
          color: post.tagColor,
          border: `1px solid ${post.tagBorder}`,
        }}
      >
        {post.tag}
      </span>

      {/* Title */}
      <h3
        className="text-base font-semibold leading-snug"
        style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
      >
        {post.title}
      </h3>

      {/* Excerpt */}
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
      >
        {post.excerpt}
      </p>

      {/* Footer */}
      <div
        className="mt-auto flex items-center justify-between pt-3 border-t"
        style={{ borderColor: 'var(--ds-border-base)' }}
      >
        <span
          className="text-xs"
          style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
        >
          {post.readTime}
        </span>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{
            backgroundColor: 'var(--ds-bg-sunken)',
            color: 'var(--ds-text-tertiary)',
          }}
        >
          Coming soon
        </span>
      </div>
    </motion.article>
  );
}
