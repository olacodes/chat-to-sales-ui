'use client';

import { useState } from 'react';
import type { Conversation } from '@/store';
import { ConversationListItem } from './ConversationListItem';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: ConversationListProps) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? conversations.filter(
        (c) =>
          c.customerName.toLowerCase().includes(search.toLowerCase()) ||
          c.customerIdentifier.toLowerCase().includes(search.toLowerCase()) ||
          c.lastMessage?.toLowerCase().includes(search.toLowerCase()),
      )
    : conversations;

  // Sort by most recent activity DESC
  const sorted = [...filtered].sort((a, b) => {
    const ta = a.lastMessageAt ?? '';
    const tb = b.lastMessageAt ?? '';
    return tb.localeCompare(ta);
  });

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
        <p className="text-xs text-gray-500">{conversations.length} total</p>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
            className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* List */}
      <ul className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-gray-50">
        {isLoading && conversations.length === 0 ? (
          // Loading skeletons
          <li className="divide-y divide-gray-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 w-2/3 rounded bg-gray-200 animate-pulse" />
                  <div className="h-2.5 w-full rounded bg-gray-100 animate-pulse" />
                </div>
              </div>
            ))}
          </li>
        ) : filtered.length === 0 ? (
          <li className="px-4 py-8 text-center text-xs text-gray-400">
            {search ? 'No conversations found.' : 'No conversations yet.'}
          </li>
        ) : (
          <>
            {sorted.map((conv) => (
              <li key={conv.id}>
                <ConversationListItem
                  conversation={conv}
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
                  className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 font-medium"
                >
                  {isFetchingNextPage ? 'Loading more…' : 'Load more conversations'}
                </button>
              </li>
            )}
          </>
        )}
      </ul>
    </aside>
  );
}
