'use client';

import type { Message, MessageRole } from '@/store';
import { formatMessageTime, getInitials } from './utils';

export type DeliveryState = 'sent' | 'delivered' | 'read' | 'failed';

interface MessageBubbleProps {
  message: Message;
  customerName: string;
  /** True when the previous message was from the same sender */
  isGrouped: boolean;
  /** Optional delivery state for outgoing messages (future-ready) */
  deliveryState?: DeliveryState;
}

const roleLabel: Record<MessageRole, string> = {
  user: '',        // label comes from customerName
  assistant: 'Support',
  system: 'System',
};

// user = incoming (left, gray)   assistant = outgoing (right, blue)
const roleBubble: Record<MessageRole, string> = {
  user:      'bg-gray-100 text-gray-900 rounded-bl-sm',
  assistant: 'bg-blue-600 text-white    rounded-br-sm',
  system:    'bg-purple-50 text-purple-900 border border-purple-100 rounded-sm',
};

const roleAvatar: Record<MessageRole, string> = {
  user:      'bg-green-100 text-green-700',
  assistant: 'bg-blue-100  text-blue-700',
  system:    'bg-purple-100 text-purple-700',
};

function DeliveryIcon({ state }: { state: DeliveryState }) {
  if (state === 'failed')    return <span className="text-[10px] text-red-400">✕</span>;
  if (state === 'read')      return <span className="text-[10px] text-blue-400">✓✓</span>;
  if (state === 'delivered') return <span className="text-[10px] text-gray-400">✓✓</span>;
  return                            <span className="text-[10px] text-gray-400">✓</span>;
}

export function MessageBubble({ message, customerName, isGrouped, deliveryState }: MessageBubbleProps) {
  const { role, content, timestamp } = message;

  // assistant messages are outgoing (right-aligned, blue)
  const isOutgoing = role === 'assistant';
  const initials   = role === 'user' ? getInitials(customerName) : role === 'assistant' ? 'AG' : 'SY';
  const label      = role === 'user' ? customerName : roleLabel[role];

  return (
    <div className={`flex items-end gap-2 ${isOutgoing ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar — invisible (not hidden) when grouped to preserve spacing */}
      <div
        className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
          roleAvatar[role]
        } ${isGrouped ? 'invisible' : ''}`}
      >
        {initials}
      </div>

      {/* Bubble + meta */}
      <div className={`flex max-w-[72%] flex-col gap-1 ${isOutgoing ? 'items-end' : 'items-start'}`}>
        {!isGrouped && (
          <span className="text-[10px] text-gray-400 px-1">{label}</span>
        )}
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${roleBubble[role]}`}>
          {content}
        </div>
        <div className={`flex items-center gap-1 px-1 ${isOutgoing ? 'flex-row-reverse' : ''}`}>
          <time className="text-[10px] text-gray-400">{formatMessageTime(timestamp)}</time>
          {isOutgoing && deliveryState && <DeliveryIcon state={deliveryState} />}
        </div>
      </div>
    </div>
  );
}
