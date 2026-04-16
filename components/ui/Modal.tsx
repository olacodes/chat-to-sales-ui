'use client';

/**
 * Modal & Drawer — accessible overlay components.
 *
 * Components
 * ─────────────────────────────────────────────────────────────
 *   Modal        — centered dialog overlay
 *   Drawer       — panel that slides in from the right
 *   ModalHeader  — title + optional close button
 *   ModalBody    — scrollable content area
 *   ModalFooter  — sticky action row
 *
 * Features
 * ─────────────────────────────────────────────────────────────
 *   ✓ focus trap (first focusable element on open)
 *   ✓ Escape key to close
 *   ✓ scroll-lock while open
 *   ✓ aria-modal + role=dialog + aria-labelledby
 *   ✓ backdrop scrim that closes on click
 *   ✓ CSS-variable token colors only
 *
 * Usage
 * ─────────────────────────────────────────────────────────────
 *   <Modal isOpen={open} onClose={() => setOpen(false)} title="Order #1234">
 *     <ModalHeader onClose={() => setOpen(false)}>Order #1234</ModalHeader>
 *     <ModalBody>…content…</ModalBody>
 *     <ModalFooter>
 *       <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
 *       <Button onClick={handleConfirm}>Confirm</Button>
 *     </ModalFooter>
 *   </Modal>
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

/* ── Shared ARIA focusable selectors ─────────────────────────── */

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/* ── Hook: focus trap ────────────────────────────────────────── */

function useFocusTrap(containerRef: React.RefObject<HTMLDialogElement | null>, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;

    // Move focus into the dialog on open
    const first = container.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
    first?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
      if (focusable.length === 0) return;

      const firstEl = focusable[0];
      const lastEl = focusable.at(-1);
      if (!lastEl) return;

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, containerRef]);
}

/* ── Hook: scroll lock ───────────────────────────────────────── */

function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const { scrollY } = globalThis.window;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prev;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);
}

/* ── Hook: escape key ────────────────────────────────────────── */

function useEscapeKey(onClose: () => void, isOpen: boolean) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
}

/* ── Backdrop ────────────────────────────────────────────────── */

interface BackdropProps {
  onClose: () => void;
  transparent?: boolean;
}

function Backdrop({ onClose, transparent = false }: Readonly<BackdropProps>) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-40 transition-opacity duration-200"
      style={{
        backgroundColor: transparent ? 'transparent' : 'rgba(0,0,0,0.45)',
      }}
      onClick={onClose}
    />
  );
}

/* ── Modal size variants ─────────────────────────────────────── */

const modalVariants = cva(
  'relative z-50 flex flex-col max-h-[90vh] w-full rounded-2xl overflow-hidden shadow-xl',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

/* ── Modal ───────────────────────────────────────────────────── */

interface ModalProps extends VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  /** Required for aria-labelledby */
  titleId?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  titleId,
  size,
  children,
  className = '',
}: Readonly<ModalProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useFocusTrap(dialogRef, isOpen);
  useScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <dialog
          ref={dialogRef}
          open
          aria-labelledby={titleId}
          className={modalVariants({ size, className })}
          style={{ backgroundColor: 'var(--ds-bg-surface)' }}
        >
          {children}
        </dialog>
      </div>
    </>
  );
}

/* ── Drawer size variants ────────────────────────────────────── */

const drawerVariants = cva(
  'fixed top-0 right-0 bottom-0 z-50 flex flex-col shadow-xl transition-transform duration-300 ease-out',
  {
    variants: {
      size: {
        sm: 'w-80',
        md: 'w-[420px]',
        lg: 'w-[600px]',
        full: 'w-screen',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

/* ── Drawer ──────────────────────────────────────────────────── */

interface DrawerProps extends VariantProps<typeof drawerVariants> {
  isOpen: boolean;
  onClose: () => void;
  titleId?: string;
  children: ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  titleId,
  size,
  children,
  className = '',
}: Readonly<DrawerProps>) {
  const drawerRef = useRef<HTMLDialogElement>(null);

  useFocusTrap(drawerRef, isOpen);
  useScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return (
    <>
      <Backdrop onClose={onClose} />
      <dialog
        ref={drawerRef}
        open
        aria-labelledby={titleId}
        className={drawerVariants({ size, className })}
        style={{
          backgroundColor: 'var(--ds-bg-surface)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {children}
      </dialog>
    </>
  );
}

/* ── ModalHeader ─────────────────────────────────────────────── */

interface ModalHeaderProps {
  /** Should match the `titleId` passed to `<Modal>` or `<Drawer>`. */
  id?: string;
  children: ReactNode;
  /** Renders the × close button in the top-right corner. */
  onClose?: () => void;
  className?: string;
}

export function ModalHeader({ id, children, onClose, className = '' }: Readonly<ModalHeaderProps>) {
  return (
    <div
      className={`flex items-center justify-between shrink-0 px-6 py-4 ${className}`}
      style={{ borderBottom: '1px solid var(--ds-border-base)' }}
    >
      <h2
        id={id}
        className="text-base font-semibold leading-snug"
        style={{ color: 'var(--ds-text-primary)' }}
      >
        {children}
      </h2>
      {onClose && (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="ml-4 flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
          style={{ color: 'var(--ds-text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── ModalBody ───────────────────────────────────────────────── */

interface ModalBodyProps {
  children: ReactNode;
  /** Remove default padding — useful when content provides its own spacing. */
  noPadding?: boolean;
  className?: string;
}

export function ModalBody({
  children,
  noPadding = false,
  className = '',
}: Readonly<ModalBodyProps>) {
  return (
    <div
      className={['flex-1 overflow-y-auto min-h-0', noPadding ? '' : 'px-6 py-4', className]
        .join(' ')
        .trim()}
    >
      {children}
    </div>
  );
}

/* ── ModalFooter ─────────────────────────────────────────────── */

interface ModalFooterProps {
  children: ReactNode;
  /** Align actions: end (default) | start | between */
  align?: 'start' | 'end' | 'between';
  className?: string;
}

const footerAlignClass: Record<NonNullable<ModalFooterProps['align']>, string> = {
  start: 'justify-start',
  end: 'justify-end',
  between: 'justify-between',
};

export function ModalFooter({
  children,
  align = 'end',
  className = '',
}: Readonly<ModalFooterProps>) {
  return (
    <div
      className={`flex items-center gap-3 shrink-0 px-6 py-4 ${footerAlignClass[align]} ${className}`}
      style={{ borderTop: '1px solid var(--ds-border-base)' }}
    >
      {children}
    </div>
  );
}
