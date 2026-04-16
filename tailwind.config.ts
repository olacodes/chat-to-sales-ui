/**
 * tailwind.config.ts — ChatToSales Design System
 *
 * Strategy (Tailwind v4)
 * ─────────────────────────────────────────────────────────────────────────────
 * All colors reference CSS custom properties defined in globals.css.
 * This means every color automatically adapts to light / dark mode without
 * requiring a `dark:` variant — Tailwind resolves CSS vars at runtime.
 *
 * Dark mode class strategy is configured in globals.css via:
 *   @custom-variant dark (&:where(.dark *));
 *
 * This file is loaded from globals.css via:
 *   @config "./tailwind.config.ts";
 *
 * Generated utility examples
 * ─────────────────────────────────────────────────────────────────────────────
 *   bg-brand           → var(--ds-brand-bg)         ← green in both modes
 *   bg-surface         → var(--ds-bg-surface)        ← white / dark-slate
 *   text-content-muted → var(--ds-text-tertiary)     ← slate-400 / slate-500
 *   border-border      → var(--ds-border-base)       ← slate-200 / slate-800
 *   text-2xs           → 11px / 1rem line-height
 *   rounded-md         → var(--ds-radius-md) = 8px
 *   shadow-md          → var(--ds-shadow-md)
 */

import type { Config } from 'tailwindcss';

export default {
  /* ── Content paths ─────────────────────────────────────────────────────── */
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './store/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      /* ── Font families ─────────────────────────────────────────────────── */
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'Cascadia Code', 'Fira Code', 'monospace'],
      },

      /* ── Typography scale (4 px base grid, 14 px body default) ────────── */
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }], // 11 px
        xs: ['0.75rem', { lineHeight: '1.125rem' }], // 12 px
        sm: ['0.8125rem', { lineHeight: '1.25rem' }], // 13 px
        base: ['0.875rem', { lineHeight: '1.375rem' }], // 14 px  ← app default
        md: ['1rem', { lineHeight: '1.5rem' }], // 16 px
        lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18 px
        xl: ['1.25rem', { lineHeight: '1.875rem' }], // 20 px
        '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24 px
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }], // 30 px
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }], // 36 px
      },

      /* ── Colour palette ────────────────────────────────────────────────── */
      /*
       * Every value is a CSS variable reference.
       * The variables switch between light and dark values in globals.css
       * via the `.dark` class on <html>, so NO `dark:` modifier is needed
       * when using these semantic colours.
       *
       * Use `dark:` variants only for one-off overrides that fall outside the
       * design system token set.
       */
      colors: {
        /* Brand — commerce green */
        brand: {
          DEFAULT: 'var(--ds-brand-bg)',
          hover: 'var(--ds-brand-bg-hover)',
          soft: 'var(--ds-brand-bg-soft)',
          muted: 'var(--ds-brand-text)',
          border: 'var(--ds-brand-border)',
        },

        /* Accent — indigo interactive / focus */
        accent: {
          DEFAULT: 'var(--ds-accent-bg)',
          hover: 'var(--ds-accent-bg-hover)',
          soft: 'var(--ds-accent-bg-soft)',
          muted: 'var(--ds-accent-text)',
          border: 'var(--ds-accent-border)',
        },

        /* Backgrounds — semantic surface stack */
        surface: {
          base: 'var(--ds-bg-base)', // page
          DEFAULT: 'var(--ds-bg-surface)', // card / panel
          elevated: 'var(--ds-bg-elevated)', // modal / dropdown
          sunken: 'var(--ds-bg-sunken)', // inset / sidebar well
          hover: 'var(--ds-bg-hover)',
          active: 'var(--ds-bg-active)',
        },

        /* Text — semantic content colours */
        content: {
          primary: 'var(--ds-text-primary)',
          secondary: 'var(--ds-text-secondary)',
          muted: 'var(--ds-text-tertiary)',
          disabled: 'var(--ds-text-disabled)',
          inverse: 'var(--ds-text-inverse)',
          brand: 'var(--ds-text-brand)',
          accent: 'var(--ds-text-accent)',
        },

        /* Borders */
        border: {
          DEFAULT: 'var(--ds-border-base)',
          strong: 'var(--ds-border-strong)',
          focus: 'var(--ds-border-focus)',
        },

        /* Status — success */
        success: {
          DEFAULT: 'var(--ds-success-dot)',
          bg: 'var(--ds-success-bg)',
          text: 'var(--ds-success-text)',
          border: 'var(--ds-success-border)',
        },

        /* Status — warning */
        warning: {
          DEFAULT: 'var(--ds-warning-dot)',
          bg: 'var(--ds-warning-bg)',
          text: 'var(--ds-warning-text)',
          border: 'var(--ds-warning-border)',
        },

        /* Status — danger */
        danger: {
          DEFAULT: 'var(--ds-danger-dot)',
          bg: 'var(--ds-danger-bg)',
          text: 'var(--ds-danger-text)',
          border: 'var(--ds-danger-border)',
        },

        /* Status — info */
        info: {
          DEFAULT: 'var(--ds-info-dot)',
          bg: 'var(--ds-info-bg)',
          text: 'var(--ds-info-text)',
          border: 'var(--ds-info-border)',
        },

        /* Sidebar */
        sidebar: {
          bg: 'var(--ds-sidebar-bg)',
          border: 'var(--ds-sidebar-border)',
          active: 'var(--ds-sidebar-item-active-bg)',
          'active-text': 'var(--ds-sidebar-item-active-text)',
          text: 'var(--ds-sidebar-item-text)',
          icon: 'var(--ds-sidebar-item-icon)',
        },

        /* Chat bubble surfaces */
        bubble: {
          out: 'var(--ds-chat-bubble-outbound)',
          in: 'var(--ds-chat-bubble-inbound)',
          chat: 'var(--ds-chat-bg)',
        },
      },

      /* ── Border radius ─────────────────────────────────────────────────── */
      borderRadius: {
        sm: 'var(--ds-radius-sm)', //  6 px
        md: 'var(--ds-radius-md)', //  8 px
        lg: 'var(--ds-radius-lg)', // 12 px
        xl: 'var(--ds-radius-xl)', // 16 px
        '2xl': 'var(--ds-radius-2xl)', // 20 px
        full: 'var(--ds-radius-full)',
      },

      /* ── Shadows ───────────────────────────────────────────────────────── */
      boxShadow: {
        xs: 'var(--ds-shadow-xs)',
        sm: 'var(--ds-shadow-sm)',
        md: 'var(--ds-shadow-md)',
        lg: 'var(--ds-shadow-lg)',
      },

      /* ── Transitions ───────────────────────────────────────────────────── */
      transitionDuration: {
        fast: '100ms',
        base: '150ms',
        slow: '250ms',
      },

      /* ── Spacing ───────────────────────────────────────────────────────── */
      /*
       * Tailwind v4 uses a 0.25 rem (4 px) base unit by default, which
       * matches the design system grid.  No override needed — standard
       * scale (p-1=4px, p-2=8px, p-4=16px …) is used throughout.
       *
       * Named aliases for common layout values:
       */
      spacing: {
        sidebar: '14rem', // 224 px — desktop sidebar width
        topbar: '3.5rem', //  56 px — topbar height
      },
    },
  },

  plugins: [],
} satisfies Config;
