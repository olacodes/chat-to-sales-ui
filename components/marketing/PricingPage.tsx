'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Sections';

// ─── Types ────────────────────────────────────────────────────────────────────

type BillingCycle = 'monthly' | 'weekly' | 'payg';

// ─── Plan data ────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 5000,
    weeklyPrice: 1400,
    desc: 'Perfect for solo merchants just getting started with chat commerce.',
    highlight: false,
    cta: 'Start free trial',
    ctaHref: '/signup',
    accentColor: 'var(--ds-brand-bg)',
    accentSoft: 'var(--ds-brand-bg-soft)',
    accentBorder: 'var(--ds-brand-border)',
    features: [
      '1 agent seat',
      'Up to 200 orders / month',
      'WhatsApp Business + 1 channel',
      'Order management & tracking',
      'In-chat payment links',
      'Basic analytics dashboard',
      'Email support',
    ],
    missing: ['AI smart replies', 'Team inbox', 'Advanced reports', 'Dedicated account manager'],
  },
  {
    id: 'growth',
    name: 'Growth',
    monthlyPrice: 7500,
    weeklyPrice: 2100,
    desc: 'For growing teams handling real volume across multiple channels.',
    highlight: true,
    cta: 'Get started',
    ctaHref: '/signup',
    accentColor: 'var(--ds-brand-bg)',
    accentSoft: 'var(--ds-brand-bg-soft)',
    accentBorder: 'var(--ds-brand-border)',
    features: [
      '3 agent seats',
      'Up to 1,000 orders / month',
      'All messaging channels',
      'Order management & tracking',
      'In-chat payment links',
      'Full analytics + CSV reports',
      'AI smart replies (50 suggestions / day)',
      'Team inbox & canned responses',
      'Priority support',
    ],
    missing: ['Unlimited AI replies', 'Dedicated account manager', 'Custom integrations'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 10000,
    weeklyPrice: 2800,
    desc: 'For established merchants who need unlimited capacity and white-glove support.',
    highlight: false,
    cta: 'Talk to us',
    ctaHref: '/signup',
    accentColor: 'var(--ds-accent-bg)',
    accentSoft: 'var(--ds-accent-bg-soft)',
    accentBorder: 'color-mix(in srgb, var(--ds-accent-bg) 30%, transparent)',
    features: [
      'Unlimited agent seats',
      'Unlimited orders',
      'All messaging channels',
      'Order management & tracking',
      'In-chat payment links',
      'Full analytics + CSV reports',
      'Unlimited AI smart replies',
      'Team inbox & canned responses',
      'Custom integrations (webhooks, API)',
      'Dedicated account manager',
      '99.9% uptime SLA',
    ],
    missing: [],
  },
] as const;

// ─── Billing toggle ───────────────────────────────────────────────────────────

interface BillingToggleProps {
  value: BillingCycle;
  onChange: (v: BillingCycle) => void;
}

const TABS: { id: BillingCycle; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'payg', label: 'Pay as you go' },
];

function BillingToggle({ value, onChange }: Readonly<BillingToggleProps>) {
  return (
    <div
      className="inline-flex rounded-xl p-1 gap-1"
      style={{
        backgroundColor: 'var(--ds-bg-elevated)',
        border: '1px solid var(--ds-border-base)',
      }}
      role="tablist"
      aria-label="Billing cycle"
    >
      {TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(tab.id)}
            className="relative px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none"
            style={{
              color: active ? 'white' : 'var(--ds-text-secondary)',
              backgroundColor: active ? 'var(--ds-brand-bg)' : 'transparent',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {tab.label}
            {tab.id === 'monthly' && (
              <span
                className="ml-1.5 text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded"
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'var(--ds-brand-bg-soft)',
                  color: active ? 'white' : 'var(--ds-brand-text)',
                }}
              >
                Save 20%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

interface PlanCardProps {
  plan: (typeof PLANS)[number];
  cycle: 'monthly' | 'weekly';
  index: number;
}

function PlanCard({ plan, cycle, index }: Readonly<PlanCardProps>) {
  const price = cycle === 'monthly' ? plan.monthlyPrice : plan.weeklyPrice;
  const period = cycle === 'monthly' ? 'month' : 'week';

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      className="relative flex flex-col rounded-2xl p-7 transition-all duration-300"
      style={{
        backgroundColor: plan.highlight ? 'var(--ds-brand-bg)' : 'var(--ds-bg-elevated)',
        border: plan.highlight
          ? '1.5px solid var(--ds-brand-bg)'
          : '1px solid var(--ds-border-base)',
        boxShadow: plan.highlight
          ? '0 8px 48px color-mix(in srgb, var(--ds-brand-bg) 30%, transparent)'
          : 'none',
      }}
    >
      {/* Popular badge */}
      {plan.highlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className="px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: 'var(--ds-brand-bg-hover, #16a34a)', color: 'white' }}
          >
            Most popular
          </span>
        </div>
      )}

      {/* Plan name */}
      <p
        className="text-xs font-bold uppercase tracking-widest mb-2"
        style={{
          color: plan.highlight ? 'rgba(255,255,255,0.7)' : 'var(--ds-text-tertiary)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {plan.name}
      </p>

      {/* Price */}
      <div className="flex items-end gap-1 mb-2">
        <span
          className="text-5xl font-black tracking-tight leading-none"
          style={{
            color: plan.highlight ? 'white' : 'var(--ds-text-primary)',
            fontFamily: "'Sora', sans-serif",
          }}
        >
          {formatNaira(price)}
        </span>
        <span
          className="mb-1 text-sm"
          style={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : 'var(--ds-text-tertiary)' }}
        >
          /{period}
        </span>
      </div>

      {/* Monthly equivalent note for weekly */}
      {cycle === 'weekly' && (
        <p
          className="text-xs mb-4"
          style={{ color: plan.highlight ? 'rgba(255,255,255,0.55)' : 'var(--ds-text-tertiary)' }}
        >
          ≈ {formatNaira(plan.weeklyPrice * 4)}/month
        </p>
      )}
      {cycle === 'monthly' && <div className="mb-4" />}

      {/* Description */}
      <p
        className="text-sm leading-relaxed mb-6"
        style={{
          color: plan.highlight ? 'rgba(255,255,255,0.75)' : 'var(--ds-text-secondary)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {plan.desc}
      </p>

      {/* CTA */}
      <Link
        href={plan.ctaHref}
        className="block text-center py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 mb-7"
        style={
          plan.highlight
            ? { backgroundColor: 'white', color: 'var(--ds-brand-bg)' }
            : {
                backgroundColor: 'var(--ds-brand-bg)',
                color: 'white',
                boxShadow: '0 2px 16px color-mix(in srgb, var(--ds-brand-bg) 30%, transparent)',
              }
        }
        onMouseEnter={(e) => {
          if (plan.highlight) {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)';
          } else {
            e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg-hover)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = plan.highlight ? 'white' : 'var(--ds-brand-bg)';
        }}
      >
        {plan.cta}
      </Link>

      {/* Divider */}
      <div
        className="mb-5 h-px"
        style={{
          backgroundColor: plan.highlight ? 'rgba(255,255,255,0.15)' : 'var(--ds-border-base)',
        }}
      />

      {/* Features */}
      <ul className="flex flex-col gap-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <span
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
              style={
                plan.highlight
                  ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }
                  : { backgroundColor: 'var(--ds-brand-bg-soft)', color: 'var(--ds-brand-bg)' }
              }
            >
              ✓
            </span>
            <span
              className="text-sm"
              style={{
                color: plan.highlight ? 'rgba(255,255,255,0.85)' : 'var(--ds-text-secondary)',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {f}
            </span>
          </li>
        ))}
        {plan.missing.map((f) => (
          <li key={f} className="flex items-start gap-2.5 opacity-35">
            <span
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px]"
              style={
                plan.highlight
                  ? { backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }
                  : { backgroundColor: 'var(--ds-bg-sunken)', color: 'var(--ds-text-tertiary)' }
              }
            >
              —
            </span>
            <span
              className="text-sm line-through"
              style={{
                color: plan.highlight ? 'rgba(255,255,255,0.4)' : 'var(--ds-text-tertiary)',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ─── Plan grid ────────────────────────────────────────────────────────────────

function PlanGrid({ cycle }: Readonly<{ cycle: 'monthly' | 'weekly' }>) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={cycle}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="grid md:grid-cols-3 gap-6 items-start"
      >
        {PLANS.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} cycle={cycle} index={i} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Pay as you go ────────────────────────────────────────────────────────────

const PAYG_TIERS = [
  {
    range: '1 – 25 orders',
    pricePerOrder: 200,
    exampleOrders: 20,
    badge: null,
    color: 'var(--ds-brand-bg)',
    soft: 'var(--ds-brand-bg-soft)',
    border: 'var(--ds-brand-border)',
  },
  {
    range: '26 – 100 orders',
    pricePerOrder: 150,
    exampleOrders: 60,
    badge: 'Most used',
    color: '#f59e0b',
    soft: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    range: '101 – 500 orders',
    pricePerOrder: 120,
    exampleOrders: 200,
    badge: null,
    color: 'var(--ds-accent-bg)',
    soft: 'var(--ds-accent-bg-soft)',
    border: 'color-mix(in srgb, var(--ds-accent-bg) 30%, transparent)',
  },
  {
    range: '501+ orders',
    pricePerOrder: 90,
    exampleOrders: 600,
    badge: 'Best rate',
    color: '#10b981',
    soft: 'rgba(16,185,129,0.10)',
    border: 'rgba(16,185,129,0.25)',
  },
] as const;

const PAYG_FEATURES = [
  'All messaging channels included',
  '1 agent seat (add more at ₦1,500/seat/month)',
  'Order management & payment links',
  'Basic analytics dashboard',
  'Email support',
  'No monthly subscription — pay only when you sell',
  'Free trial: first 10 orders free',
];

function PaygSection() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="payg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="grid lg:grid-cols-2 gap-10 items-start"
      >
        {/* Left: pricing tiers */}
        <div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
          >
            Price per completed order
          </h3>
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
          >
            {'You only pay when an order is marked as '}
            <strong style={{ color: 'var(--ds-brand-text)', fontWeight: 600 }}>completed</strong>
            {'. Pending, cancelled, or returned orders are never charged.'}
          </p>

          <div className="flex flex-col gap-3">
            {PAYG_TIERS.map((tier, i) => (
              <motion.div
                key={tier.range}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="flex items-center justify-between px-5 py-4 rounded-xl"
                style={{
                  backgroundColor: 'var(--ds-bg-elevated)',
                  border: `1px solid var(--ds-border-base)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: tier.color }}
                  />
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: 'var(--ds-text-primary)',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {tier.range}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: 'var(--ds-text-tertiary)',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Example: {tier.exampleOrders} orders ={' '}
                      {formatNaira(tier.exampleOrders * tier.pricePerOrder)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {tier.badge && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: tier.soft, color: tier.color }}
                    >
                      {tier.badge}
                    </span>
                  )}
                  <span
                    className="text-base font-black"
                    style={{ color: tier.color, fontFamily: "'Sora', sans-serif" }}
                  >
                    ₦{tier.pricePerOrder}
                    <span
                      className="text-xs font-normal ml-0.5"
                      style={{ color: 'var(--ds-text-tertiary)' }}
                    >
                      /order
                    </span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Volume note */}
          <p
            className="mt-4 text-xs"
            style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
          >
            * Rates are applied per tier on a rolling monthly basis. No minimum spend.
          </p>
        </div>

        {/* Right: what's included + CTA */}
        <div
          className="rounded-2xl p-7 flex flex-col gap-6"
          style={{
            backgroundColor: 'var(--ds-bg-elevated)',
            border: '1px solid var(--ds-border-base)',
          }}
        >
          {/* Free badge */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
              style={{
                backgroundColor: 'var(--ds-brand-bg-soft)',
                border: '1px solid var(--ds-brand-border)',
              }}
            >
              🎁
            </div>
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
              >
                First 10 orders — free
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
              >
                No card required to start
              </p>
            </div>
          </div>

          <div className="h-px" style={{ backgroundColor: 'var(--ds-border-base)' }} />

          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
            >
              What&apos;s included
            </p>
            <ul className="flex flex-col gap-2.5">
              {PAYG_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                    style={{
                      backgroundColor: 'var(--ds-brand-bg-soft)',
                      color: 'var(--ds-brand-bg)',
                    }}
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
                    {f}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/signup"
            className="mt-2 block text-center py-3.5 px-6 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              backgroundColor: 'var(--ds-brand-bg)',
              color: 'white',
              boxShadow: '0 4px 24px color-mix(in srgb, var(--ds-brand-bg) 30%, transparent)',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg-hover)')
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg)')}
          >
            Start selling for free →
          </Link>

          <p
            className="text-center text-xs"
            style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
          >
            Upgrade to a monthly plan anytime with no data loss.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Can I switch between billing cycles?',
    a: 'Yes. You can move from weekly to monthly (or vice versa) at any time. Your balance will be prorated. Switching to Pay as you go is always available and your data is never affected.',
  },
  {
    q: 'What counts as a "completed order" for PAYG?',
    a: 'An order is counted as completed only when you or your agent manually marks it as completed inside ChatToSales. Pending, cancelled, returned, or draft orders are not billed.',
  },
  {
    q: 'Is there a free trial for the monthly plans?',
    a: 'Yes — every plan includes a 14-day free trial with full features. No credit card required. After the trial you can choose a plan or move to Pay as you go.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept debit/credit cards (Visa, Mastercard), bank transfer, and USSD. Payments are processed securely via Paystack.',
  },
  {
    q: 'Can I add more agents on the Starter or PAYG plan?',
    a: 'Yes. Additional agent seats are available at ₦1,500 per seat per month on any plan, including Pay as you go.',
  },
  {
    q: 'What happens if I exceed my monthly order limit?',
    a: 'On Starter and Growth plans, orders beyond your limit continue to process at ₦150 per additional order. We will notify you before you hit the limit so you can upgrade.',
  },
] as const;

function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24" style={{ backgroundColor: 'var(--ds-bg-base)' }}>
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--ds-brand-text)', fontFamily: "'DM Sans', sans-serif" }}
          >
            FAQ
          </p>
          <h2
            className="text-4xl font-bold tracking-tight"
            style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
          >
            Common questions
          </h2>
        </motion.div>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="rounded-xl overflow-hidden"
                style={{
                  border: '1px solid var(--ds-border-base)',
                  backgroundColor: isOpen ? 'var(--ds-bg-elevated)' : 'var(--ds-bg-surface)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span
                    className="text-sm font-semibold pr-4"
                    style={{
                      color: 'var(--ds-text-primary)',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs transition-transform duration-200"
                    style={{
                      backgroundColor: isOpen ? 'var(--ds-brand-bg-soft)' : 'var(--ds-bg-sunken)',
                      color: isOpen ? 'var(--ds-brand-bg)' : 'var(--ds-text-tertiary)',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                  >
                    +
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p
                        className="px-5 pb-4 text-sm leading-relaxed"
                        style={{
                          color: 'var(--ds-text-secondary)',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function PricingCta() {
  return (
    <section
      className="py-24 relative overflow-hidden border-t"
      style={{ backgroundColor: 'var(--ds-bg-surface)', borderColor: 'var(--ds-border-base)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 100%, var(--ds-brand-bg-soft) 0%, transparent 70%)',
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
          Not sure which plan?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-lg mb-8"
          style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
        >
          Start on Pay as you go — zero risk. Upgrade to a monthly plan the moment it saves you
          money. Our team can help you decide.
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
            href="mailto:hello@chattosales.com"
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
            Talk to sales
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Page assembly ────────────────────────────────────────────────────────────

export function PricingPageContent() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  return (
    <div style={{ backgroundColor: 'var(--ds-bg-base)' }}>
      <Navbar />
      <main>
        {/* Hero */}
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
          <div className="mx-auto max-w-7xl px-6 relative">
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'var(--ds-brand-text)', fontFamily: "'DM Sans', sans-serif" }}
              >
                Pricing
              </p>
              <h1
                className="text-5xl md:text-6xl font-bold tracking-tight mb-5"
                style={{ color: 'var(--ds-text-primary)', fontFamily: "'Sora', sans-serif" }}
              >
                Simple, honest pricing
              </h1>
              <p
                className="text-lg md:text-xl max-w-2xl mx-auto"
                style={{ color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}
              >
                Start free. Pay only for what you use. No hidden fees, no surprises.
              </p>
            </motion.div>

            {/* Billing toggle */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="flex justify-center mb-12"
            >
              <BillingToggle value={cycle} onChange={setCycle} />
            </motion.div>

            {/* Weekly savings note */}
            {cycle === 'weekly' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm mb-8"
                style={{ color: 'var(--ds-text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}
              >
                Monthly billing saves ~20% compared to weekly. Switch anytime.
              </motion.p>
            )}

            {/* Plans or PAYG */}
            {cycle === 'payg' ? <PaygSection /> : <PlanGrid cycle={cycle} />}
          </div>
        </section>

        <Faq />
        <PricingCta />
      </main>
      <Footer />
    </div>
  );
}
