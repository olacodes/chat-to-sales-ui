'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import type { Conversation } from '@/store';
import { ConversationListItem } from './ConversationListItem';

export type ConversationTab = 'unassigned' | 'mine' | 'all';

function EmptyListMessage({ hasSearch }: Readonly<{ hasSearch: boolean }>) {
  return hasSearch ? <>No conversations found.</> : <>No conversations yet.</>;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  /** The currently authenticated user's ID — used to filter the "Mine" tab */
  currentUserId?: string | null;
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

const SKELETON_IDS = ['sk-1', 'sk-2', 'sk-3', 'sk-4'] as const;
const SKELETON_WIDTHS = [55, 72, 60, 80] as const;

const TAB_LABELS: Record<ConversationTab, string> = {
  unassigned: 'Unassigned',
  mine: 'Mine',
  all: 'All',
};

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  currentUserId,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: Readonly<ConversationListProps>) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<ConversationTab>('unassigned');

  // Unread counts live in Zustand so React Query refetches never reset them
  const unreadCounts = useAppStore((s) => s.unreadCounts);

  // Tab counts (computed before search filter)
  const tabCounts: Record<ConversationTab, number> = {
    unassigned: conversations.filter((c) => c.assignedTo === null).length,
    mine: conversations.filter((c) => currentUserId && c.assignedTo?.id === currentUserId).length,
    all: conversations.length,
  };

  // Apply tab filter first, then search
  const tabFiltered = conversations.filter((c) => {
    if (activeTab === 'unassigned') return c.assignedTo === null;
    if (activeTab === 'mine') return currentUserId && c.assignedTo?.id === currentUserId;
    return true; // 'all'
  });

  const filtered = search.trim()
    ? tabFiltered.filter(
        (c) =>
          c.customerName.toLowerCase().includes(search.toLowerCase()) ||
          c.customerIdentifier.toLowerCase().includes(search.toLowerCase()) ||
          c.lastMessage?.toLowerCase().includes(search.toLowerCase()),
      )
    : tabFiltered;

  // Sort by most recent activity DESC
  const sorted = [...filtered].sort((a, b) => {
    const ta = a.lastMessageAt ?? '';
    const tb = b.lastMessageAt ?? '';
    return tb.localeCompare(ta);
  });

  function renderListContent() {
    if (isLoading && conversations.length === 0) {
      return (
        <>
          {SKELETON_IDS.map((skId, i) => (
            <li
              key={skId}
              className="flex items-start gap-3 px-4 py-3"
              style={{ borderBottom: '1px solid var(--ds-border-subtle)' }}
              aria-hidden="true"
            >
              <div
                className="h-10 w-10 rounded-full shrink-0 animate-pulse"
                style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
              />
              <div className="flex-1 space-y-2 pt-1">
                <div
                  className="h-3 rounded animate-pulse"
                  style={{
                    width: `${SKELETON_WIDTHS[i]}%`,
                    backgroundColor: 'var(--ds-bg-sunken)',
                  }}
                />
                <div
                  className="h-2.5 w-full rounded animate-pulse"
                  style={{ backgroundColor: 'var(--ds-bg-subtle)' }}
                />
              </div>
            </li>
          ))}
        </>
      );
    }
    if (sorted.length === 0) {
      return (
        <li className="px-4 py-8 text-center text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
          <EmptyListMessage hasSearch={Boolean(search)} />
        </li>
      );
    }
    return (
      <>
        {sorted.map((conv) => (
          <li key={conv.id} style={{ borderBottom: '1px solid var(--ds-border-subtle)' }}>
            <ConversationListItem
              conversation={{ ...conv, unreadCount: unreadCounts[conv.id] ?? 0 }}
              isActive={conv.id === activeId}
              onClick={() => onSelect(conv.id)}
            />
          </li>
        ))}
        {hasNextPage && (
          <li className="px-4 py-3 text-center">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isFetchingNextPage}
              className="text-xs font-medium disabled:opacity-50 transition-opacity"
              style={{ color: 'var(--ds-brand-text)' }}
            >
              {isFetchingNextPage ? 'Loading more\u2026' : 'Load more conversations'}
            </button>
          </li>
        )}
      </>
    );
  }

  return (
    <aside
      className="flex h-full w-full shrink-0 flex-col md:w-80"
      style={{
        borderRight: '1px solid var(--ds-border-base)',
        backgroundColor: 'var(--ds-bg-surface)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 pt-3 pb-0 shrink-0"
        style={{ borderBottom: '1px solid var(--ds-border-base)' }}
      >
        <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
          Conversations
        </h2>
        {/* Tabs */}
        <div className="flex gap-0" role="tablist" aria-label="Conversation filter">
          {(Object.keys(TAB_LABELS) as ConversationTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const count = tabCounts[tab];
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors relative"
                style={{
                  color: isActive ? 'var(--ds-brand-text)' : 'var(--ds-text-secondary)',
                  borderBottom: isActive
                    ? '2px solid var(--ds-brand-bg)'
                    : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                {TAB_LABELS[tab]}
                {count > 0 && (
                  <span
                    className="rounded-full px-1.5 py-px text-[10px] font-bold leading-none"
                    style={{
                      backgroundColor: isActive
                        ? 'var(--ds-brand-bg)'
                        : 'var(--ds-bg-elevated)',
                      color: isActive
                        ? 'var(--ds-text-inverse)'
                        : 'var(--ds-text-tertiary)',
                    }}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div
        className="px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--ds-border-base)' }}
      >
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
            style={{ color: 'var(--ds-text-tertiary)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            aria-label="Search conversations"
            className="w-full rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none transition-shadow"
            style={{
              border: '1px solid var(--ds-border-base)',
              backgroundColor: 'var(--ds-bg-sunken)',
              color: 'var(--ds-text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--ds-border-focus)';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px color-mix(in srgb, var(--ds-brand-bg) 12%, transparent)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--ds-border-base)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* List */}
      <ul className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {renderListContent()}
      </ul>
    </aside>
  );
}
