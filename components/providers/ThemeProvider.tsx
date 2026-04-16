'use client';

/**
 * ThemeProvider — manages light/dark mode for the entire app.
 *
 * Strategy
 * ────────────────────────────────────────────────────────────────────────────
 * 1. app/layout.tsx injects an inline script BEFORE hydration that reads
 *    localStorage and applies `.dark` to <html> immediately — zero flash.
 * 2. ThemeProvider mounts, reads the same localStorage key, and syncs React
 *    state so toggle components render the correct icon without a network
 *    round-trip or useEffect flicker on colors (those are already correct
 *    via CSS variables).
 * 3. On every theme change, the provider:
 *      a) Toggles `.dark` on document.documentElement.
 *      b) Persists the choice to localStorage under STORAGE_KEY.
 *
 * Dark mode mechanism
 * ────────────────────────────────────────────────────────────────────────────
 * All semantic colors are CSS custom properties (`--ds-*`) that switch values
 * inside `.dark { }` in globals.css.  Tailwind's `dark:` variant is wired via
 *   @custom-variant dark (&:where(.dark *));
 * so both inline-style tokens AND Tailwind `dark:` classes respond to the
 * single `.dark` class on <html>.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/* ── Types ───────────────────────────────────────────────────── */

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  /** Current resolved theme. */
  theme: Theme;
  /** Toggle between light and dark. */
  toggleTheme: () => void;
  /** Set theme explicitly. */
  setTheme: (theme: Theme) => void;
}

/* ── Constants ───────────────────────────────────────────────── */

/** Must match the key used in the anti-flash inline script in app/layout.tsx. */
export const THEME_STORAGE_KEY = 'cts-theme';

/* ── Context ─────────────────────────────────────────────────── */

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* ── Helpers ─────────────────────────────────────────────────── */

function readStoredTheme(): Theme {
  if (globalThis.window === undefined) return 'light';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // localStorage blocked (private mode, permissions policy)
  }
  return globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage blocked — persist silently fails
  }
}

/* ── Provider ────────────────────────────────────────────────── */

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  /*
   * Server render: always 'light' (safe default, inline script handles FOIT).
   * Client mount: corrected in the effect below before first paint matters.
   */
  const [theme, setTheme] = useState<Theme>('light');

  /* Sync React state from localStorage/system on first mount. */
  useEffect(() => {
    setTheme(readStoredTheme());
  }, []);

  /* Apply .dark class + persist whenever theme state changes. */
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function setThemeExplicit(t: Theme): void {
    setTheme(t);
  }

  function toggleTheme(): void {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  const contextValue = useMemo(
    () => ({ theme, toggleTheme, setTheme: setThemeExplicit }),
    // toggleTheme and setThemeExplicit are stable (defined inside component but
    // referencing only the stable setTheme dispatcher) — listed below to be safe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

/* ── Hook ────────────────────────────────────────────────────── */

/**
 * Access the current theme and theme-switching functions.
 * Must be called inside a component rendered within <ThemeProvider>.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error('useTheme must be used within <ThemeProvider>');
  }
  return ctx;
}
