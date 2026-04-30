'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AppIcon } from '@/components/ui/AppIcon';
import { useAuthStore } from '@/store/useAuthStore';
import { restoreSession } from '@/lib/auth/service';

const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'Product', href: '/product' },
  { label: 'Features', href: '/features' },
  { label: 'Stores', href: '/stores' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
];

export function Navbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Restore session from sessionStorage so isAuthenticated reflects real state on the marketing page.
  // mounted guard prevents hydration mismatch (sessionStorage is browser-only).
  useEffect(() => {
    restoreSession();
    setMounted(true);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'var(--ds-bg-surface)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--ds-border-base)' : '1px solid transparent',
        boxShadow: scrolled ? 'var(--ds-shadow-sm)' : 'none',
      }}
    >
      <nav className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 select-none">
          <AppIcon size={36} />
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: 'var(--ds-text-primary)' }}
          >
            ChatToSales
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: 'var(--ds-text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ds-text-secondary)')}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {mounted && isAuthenticated ? (
            <Link
              href="/dashboard"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200"
              style={{ backgroundColor: 'var(--ds-brand-bg)', color: 'white' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg-hover)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg)')}
            >
              Go to dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-150"
                style={{
                  color: 'var(--ds-text-secondary)',
                  border: '1px solid var(--ds-border-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--ds-text-primary)';
                  e.currentTarget.style.borderColor = 'var(--ds-border-strong)';
                  e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--ds-text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--ds-border-base)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                style={{ backgroundColor: 'var(--ds-brand-bg)', color: 'white' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg-hover)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg)')}
              >
                Start free
              </Link>
            </>
          )}
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex flex-col gap-1.5 p-2 rounded-lg"
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block h-0.5 w-5 rounded"
                style={{ backgroundColor: 'var(--ds-text-secondary)' }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{ backgroundColor: 'var(--ds-bg-surface)', borderColor: 'var(--ds-border-base)' }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium"
              style={{ color: 'var(--ds-text-secondary)' }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            {mounted && isAuthenticated ? (
              <Link
                href="/dashboard"
                className="text-sm font-semibold px-4 py-2 rounded-lg"
                style={{ backgroundColor: 'var(--ds-brand-bg)', color: 'white' }}
                onClick={() => setMenuOpen(false)}
              >
                Go to dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-lg border"
                  style={{
                    color: 'var(--ds-text-secondary)',
                    borderColor: 'var(--ds-border-base)',
                  }}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold px-4 py-2 rounded-lg"
                  style={{ backgroundColor: 'var(--ds-brand-bg)', color: 'white' }}
                >
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </motion.header>
  );
}
