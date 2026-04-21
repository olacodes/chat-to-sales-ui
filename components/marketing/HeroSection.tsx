'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const AVATARS = ['#16a34a', '#4f46e5', '#a855f7', '#f59e0b', '#22d3ee'];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: 'easeOut' as const },
  }),
};

// ── Chat data for the phone mockup ────────────────────────────────────────────
const CHAT_MESSAGES = [
  { id: 1, from: 'user', text: 'Hi! Do you have Adidas Yeezy Boost size 43? 🙏', delay: 1.0 },
  { id: 2, from: 'agent', text: 'Yes! 🔥 Size 43 available — ₦95,000. Reserve one?', delay: 1.7 },
  { id: 3, from: 'user', text: 'Yes please, I want to pay now!', delay: 2.4 },
  { id: 4, from: 'order', text: '', delay: 3.0 },
] as const;

const FLOATS = [
  {
    id: 'wa',
    icon: '💬',
    label: 'WhatsApp',
    sub: 'Connected · 3 active',
    dotColor: '#22c55e',
    top: '4%',
    left: '-3%',
    delay: 1.2,
  },
  {
    id: 'rev',
    icon: '💰',
    label: '₦2.4M',
    sub: 'Revenue today',
    dotColor: '#4f46e5',
    top: '6%',
    right: '-5%',
    delay: 1.5,
  },
  {
    id: 'orders',
    icon: '📦',
    label: '18 orders',
    sub: 'Created this hour',
    dotColor: '#f59e0b',
    bottom: '10%',
    right: '-3%',
    delay: 3.4,
  },
] as const;

// ── Phone mockup ──────────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div
      className="relative mx-auto"
      style={{
        width: 296,
        borderRadius: 28,
        backgroundColor: 'var(--ds-bg-surface)',
        border: '1px solid var(--ds-border-strong)',
        boxShadow:
          'var(--ds-shadow-lg), 0 0 0 6px color-mix(in srgb, var(--ds-bg-surface) 90%, var(--ds-border-base))',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-3 pb-2.5"
        style={{
          backgroundColor: 'var(--ds-bg-elevated)',
          borderBottom: '1px solid var(--ds-border-base)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--ds-brand-bg)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72A7.97 7.97 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <p
              className="text-[12px] font-semibold leading-none"
              style={{ color: 'var(--ds-text-primary)' }}
            >
              ChatToSales
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: '#22c55e' }}
              />
              <p className="text-[9px]" style={{ color: 'var(--ds-text-tertiary)' }}>
                WhatsApp · live
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'var(--ds-border-strong)' }}
            />
          ))}
        </div>
      </div>

      {/* Chat body */}
      <div
        className="relative flex flex-col gap-2.5 px-3 pt-3 pb-4"
        style={{ backgroundColor: 'var(--ds-chat-bg)', minHeight: 330 }}
      >
        {/* Subtle dot wallpaper */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--ds-border-base) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
            opacity: 0.6,
          }}
        />
        <div className="relative flex flex-col gap-2.5">
          <div className="flex justify-center">
            <span
              className="text-[9px] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--ds-bg-elevated)', color: 'var(--ds-text-tertiary)' }}
            >
              Today
            </span>
          </div>

          {CHAT_MESSAGES.map((msg) => {
            if (msg.from === 'order') {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: msg.delay, duration: 0.4 }}
                  className="ml-auto"
                  style={{ maxWidth: '88%' }}
                >
                  <div
                    className="rounded-2xl rounded-br-sm overflow-hidden"
                    style={{ backgroundColor: 'var(--ds-chat-bubble-outbound)' }}
                  >
                    <div
                      className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      <span className="text-xs">📦</span>
                      <span
                        className="text-[10px] font-semibold"
                        style={{ color: 'rgba(255,255,255,0.9)' }}
                      >
                        Order #1042 Created
                      </span>
                    </div>
                    <div className="px-3 py-2">
                      <p
                        className="text-[10px] font-medium"
                        style={{ color: 'rgba(255,255,255,0.95)' }}
                      >
                        Adidas Yeezy Boost · Size 43
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        Qty: 1 · ₦95,000
                      </p>
                    </div>
                    <div
                      className="mx-2.5 mb-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' }}
                    >
                      Pay with Paystack →
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-0.5 px-1">
                    <span className="text-[9px]" style={{ color: 'var(--ds-text-tertiary)' }}>
                      10:42
                    </span>
                    <span className="text-[9px] font-medium" style={{ color: '#22c55e' }}>
                      ✓✓
                    </span>
                  </div>
                </motion.div>
              );
            }
            const isOut = msg.from === 'agent';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: msg.delay, duration: 0.35 }}
                className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-3 py-2 text-[11px] leading-relaxed rounded-2xl ${isOut ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                  style={{
                    maxWidth: '84%',
                    ...(isOut
                      ? {
                          backgroundColor: 'var(--ds-chat-bubble-outbound)',
                          color: 'var(--ds-chat-text-outbound)',
                        }
                      : {
                          backgroundColor: 'var(--ds-chat-bubble-inbound)',
                          color: 'var(--ds-chat-text-inbound)',
                          border: '1px solid var(--ds-chat-bubble-in-border)',
                        }),
                  }}
                >
                  {msg.text}
                </div>
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 4.2, duration: 0.4 }}
            className="flex justify-center"
          >
            <span
              className="inline-flex items-center gap-1.5 text-[9px] font-semibold px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: 'var(--ds-success-bg)',
                color: 'var(--ds-success-text)',
                border: '1px solid var(--ds-success-border)',
              }}
            >
              ✅ Payment Confirmed · ₦95,000 received
            </span>
          </motion.div>
        </div>
      </div>

      {/* Input bar */}
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{
          backgroundColor: 'var(--ds-bg-elevated)',
          borderTop: '1px solid var(--ds-border-base)',
        }}
      >
        <div
          className="flex-1 rounded-full px-3 py-1.5 text-[10px]"
          style={{
            backgroundColor: 'var(--ds-bg-surface)',
            border: '1px solid var(--ds-border-base)',
            color: 'var(--ds-text-tertiary)',
          }}
        >
          Type a message…
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--ds-brand-bg)' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: 'var(--ds-bg-base)' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--ds-border-base) 1px, transparent 1px), linear-gradient(90deg, var(--ds-border-base) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.5,
        }}
      />

      {/* Radial blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--ds-brand-bg-soft) 0%, transparent 70%)',
          top: '-10%',
          left: '-5%',
          filter: 'blur(60px)',
          opacity: 0.6,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--ds-accent-bg-soft) 0%, transparent 70%)',
          bottom: '5%',
          right: '5%',
          filter: 'blur(80px)',
          opacity: 0.5,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-20 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col items-start gap-7 lg:max-w-[52%]">
            {/* Eyebrow */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <span
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-widest"
                style={{
                  backgroundColor: 'var(--ds-brand-bg-soft)',
                  border: '1px solid var(--ds-brand-border)',
                  color: 'var(--ds-brand-text)',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: 'var(--ds-brand-bg)' }}
                />
                WhatsApp · Instagram · TikTok Commerce
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight"
              style={{ fontFamily: "'Sora', sans-serif", color: 'var(--ds-text-primary)' }}
            >
              Turn chat into{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, var(--ds-brand-bg), var(--ds-accent-bg))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                trackable
              </span>
              <br />
              revenue
            </motion.h1>

            {/* Subtext */}
            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-lg leading-relaxed max-w-lg"
              style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
            >
              From WhatsApp to Instagram to TikTok — ChatToSales centralises your conversations,
              converts chats into orders, and runs your sales pipeline automatically.
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: 'var(--ds-brand-bg)',
                  color: 'white',
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: '0 4px 24px color-mix(in srgb, var(--ds-brand-bg) 40%, transparent)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg-hover)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Start for free
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150"
                style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ds-text-secondary)')}
              >
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full"
                  style={{
                    background: 'var(--ds-bg-elevated)',
                    border: '1px solid var(--ds-border-base)',
                  }}
                >
                  <svg
                    width="10"
                    height="12"
                    viewBox="0 0 10 12"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M0 0l10 6-10 6V0z" />
                  </svg>
                </span>
                See it in action
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {AVATARS.map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ring-2"
                    style={{
                      background: color,
                      color: 'white',
                      boxShadow: '0 0 0 2px var(--ds-bg-base)',
                    }}
                    aria-hidden="true"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="#f59e0b"
                      aria-hidden="true"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Trusted by <strong style={{ color: 'var(--ds-text-secondary)' }}>500+</strong>{' '}
                  merchants
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Right column: product mockup ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 relative w-full flex items-center justify-center"
            style={{ minHeight: 520 }}
          >
            {/* Ambient glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: 380,
                height: 380,
                borderRadius: '50%',
                background: 'radial-gradient(circle, var(--ds-brand-bg-soft) 0%, transparent 65%)',
                filter: 'blur(48px)',
                opacity: 0.9,
              }}
            />

            {/* Floating stat cards */}
            {FLOATS.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: f.delay, duration: 0.45 }}
                className="absolute z-20 pointer-events-none"
                style={{
                  top: 'top' in f ? f.top : undefined,
                  bottom: 'bottom' in f ? f.bottom : undefined,
                  left: 'left' in f ? f.left : undefined,
                  right: 'right' in f ? f.right : undefined,
                }}
              >
                <div
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                  style={{
                    backgroundColor: 'var(--ds-bg-elevated)',
                    border: '1px solid var(--ds-border-base)',
                    boxShadow: 'var(--ds-shadow-md)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span className="text-sm">{f.icon}</span>
                  <div>
                    <p
                      className="text-xs font-semibold leading-none"
                      style={{ color: 'var(--ds-text-primary)' }}
                    >
                      {f.label}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: f.dotColor }}
                      />
                      <p className="text-[10px]" style={{ color: 'var(--ds-text-tertiary)' }}>
                        {f.sub}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="relative z-10">
              <PhoneMockup />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
