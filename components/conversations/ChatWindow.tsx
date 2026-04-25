'use client';

import { useEffect, useRef, useState } from 'react';
import type { Conversation, CreditSale, Message, Order, ScheduledMessage, StaffMember } from '@/store';
import type { ConnectionStatus } from '@/lib/websocket/client';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { InlineOrderCard } from './InlineOrderCard';
import { AssignmentPanel } from './AssignmentPanel';
import { CreateOrderModal } from './CreateOrderModal';
import { formatScheduledTime } from '@/lib/utils/snoozePresets';
import type { CreateOrderPayload } from '@/lib/api/types';

interface ChatWindowProps {
  conversation: Conversation;
  /** Explicit message list — from React Query. Falls back to conversation.messages. */
  messages?: Message[];
  /** Show a loading skeleton while the first page of messages is fetching. */
  isLoadingMessages?: boolean;
  /** Show a "load earlier" button at the top when more pages exist. */
  hasMoreMessages?: boolean;
  isFetchingMoreMessages?: boolean;
  onLoadMoreMessages?: () => void;
  onSendMessage: (conversationId: string, content: string) => void;
  isSending?: boolean;
  wsStatus: ConnectionStatus;
  /** Linked order for this conversation — shown as InlineOrderCard above input */
  linkedOrder?: Order | null;
  /** Opens the order detail drawer/modal */
  onViewOrderDetails?: (orderId: string) => void;
  /** Mobile only — called when user taps the back arrow to return to the list */
  onBack?: () => void;
  /** Staff list for the assignment dropdown */
  staff?: StaffMember[];
  /** The currently authenticated user's ID */
  currentUserId?: string | null;
  /** Called when a staff member is selected (or null to unassign) */
  onAssign?: (
    conversationId: string,
    userId: string | null,
    staffMember: StaffMember | null,
  ) => void;
  isAssigning?: boolean;
  /** Called when the user picks an emoji reaction on a message. */
  onReact?: (conversationId: string, messageId: string, emoji: string) => void;
  /** Pending scheduled messages for this conversation. */
  scheduledMessages?: ScheduledMessage[];
  /** Called when the user cancels a scheduled message. */
  onCancelScheduledMessage?: (conversationId: string, scheduledMessageId: string) => void;
  /** Called when the user schedules a message from the input. */
  onScheduleMessage?: (conversationId: string, content: string, scheduledFor: string) => void;
  /** Active credit sale for this conversation — shows Send Reminder button */
  activeCreditSale?: CreditSale | null;
  /** Called when the agent taps "Send Reminder" */
  onSendReminder?: (creditSaleId: string) => void;
  isSendingReminder?: boolean;
  /** Called when the agent marks the linked order as a credit sale */
  onMarkAsCredit?: (orderId: string, amount: number) => void;
  hasActiveCreditSale?: boolean;
  /** Called when the agent submits the Create Order form */
  onCreateOrder?: (payload: CreateOrderPayload) => void;
  isCreatingOrder?: boolean;
  /** Called when the agent confirms an inquiry order from the inline card */
  onConfirmOrder?: (orderId: string) => void;
  isConfirmingOrder?: boolean;
  /** Called when the agent marks a confirmed order as paid */
  onMarkOrderPaid?: (orderId: string) => void;
  isMarkingOrderPaid?: boolean;
  /** Order switcher — index of the currently displayed order (0-based) */
  orderIndex?: number;
  /** Total number of orders linked to this conversation */
  totalOrders?: number;
  onPrevOrder?: () => void;
  onNextOrder?: () => void;
}


type WsBannerConfig = {
  show: boolean;
  text: string;
  bg: string;
  text_color: string;
  border: string;
};
const wsBanner: Record<ConnectionStatus, WsBannerConfig> = {
  connected: { show: false, text: '', bg: '', text_color: '', border: '' },
  connecting: {
    show: true,
    text: 'Connecting to live updates…',
    bg: 'var(--ds-warning-bg)',
    text_color: 'var(--ds-warning-text)',
    border: 'var(--ds-warning-border)',
  },
  disconnected: {
    show: true,
    text: 'Disconnected — reconnecting…',
    bg: 'var(--ds-danger-bg)',
    text_color: 'var(--ds-danger-text)',
    border: 'var(--ds-danger-border)',
  },
  error: {
    show: true,
    text: 'Connection error — retrying…',
    bg: 'var(--ds-danger-bg)',
    text_color: 'var(--ds-danger-text)',
    border: 'var(--ds-danger-border)',
  },
};

const SKELETON_WIDTHS = [70, 50, 78, 45] as const;
const SKELETON_IDS = ['skel-a', 'skel-b', 'skel-c', 'skel-d'] as const;

function MessageSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading messages" aria-busy="true">
      {SKELETON_IDS.map((skId, i) => (
        <div
          key={skId}
          className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
          aria-hidden="true"
        >
          <div
            className="h-9 rounded-2xl animate-pulse"
            style={{ width: `${SKELETON_WIDTHS[i]}%`, backgroundColor: 'var(--ds-bg-elevated)' }}
          />
        </div>
      ))}
    </div>
  );
}

export function ChatWindow({
  conversation,
  messages: messagesProp,
  isLoadingMessages = false,
  hasMoreMessages = false,
  isFetchingMoreMessages = false,
  onLoadMoreMessages,
  onSendMessage,
  isSending = false,
  wsStatus,
  linkedOrder,
  onViewOrderDetails,
  onBack,
  staff = [],
  currentUserId,
  onAssign,
  isAssigning = false,
  onReact,
  scheduledMessages = [],
  onCancelScheduledMessage,
  onScheduleMessage,
  activeCreditSale,
  onSendReminder,
  isSendingReminder = false,
  onMarkAsCredit,
  hasActiveCreditSale = false,
  onCreateOrder,
  isCreatingOrder = false,
  onConfirmOrder,
  isConfirmingOrder = false,
  onMarkOrderPaid,
  isMarkingOrderPaid = false,
  orderIndex = 0,
  totalOrders = 1,
  onPrevOrder,
  onNextOrder,
}: Readonly<ChatWindowProps>) {
  const { id, customerName, customerIdentifier, assignedTo } = conversation;
  const messages = messagesProp ?? conversation.messages;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [orderCollapsed, setOrderCollapsed] = useState(true);
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  // Collapse the card whenever the displayed order changes
  useEffect(() => { setOrderCollapsed(true); }, [linkedOrder?.id]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderSourceMessage, setOrderSourceMessage] = useState<string | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const banner = wsBanner[wsStatus];

  function renderMessages() {
    if (isLoadingMessages && messages.length === 0) {
      return <MessageSkeleton />;
    }
    if (messages.length === 0) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>
            No messages yet. Start the conversation.
          </p>
        </div>
      );
    }
    const agentSource = assignedTo ?? staff.find((s) => s.id === currentUserId) ?? null;
    const agentName = agentSource
      ? (agentSource.displayName ?? agentSource.email.split('@')[0])
      : null;

    return messages.map((msg, idx) => {
      const prev = messages[idx - 1];
      const isGrouped = Boolean(prev?.role === msg.role);
      return (
        <MessageBubble
          key={msg.id}
          message={msg}
          customerName={customerName}
          isGrouped={isGrouped}
          agentName={agentName}
          onReply={setReplyTo}
          currentUserId={currentUserId}
          onReact={
            onReact
              ? (emoji) => onReact(id, msg.id, emoji)
              : undefined
          }
          onCreateOrder={
            onCreateOrder
              ? (content) => {
                  setOrderSourceMessage(content);
                  setOrderModalOpen(true);
                }
              : undefined
          }
        />
      );
    });
  }

  // Customer initials for avatar
  const initials = customerName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="flex h-full flex-1 flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--ds-bg-surface)' }}
    >
      {/* ── Chat header ─────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{
          borderBottom: '1px solid var(--ds-border-base)',
          backgroundColor: 'var(--ds-bg-surface)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button — mobile only */}
          {onBack && (
            <button
              type="button"
              aria-label="Back to conversations"
              onClick={onBack}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg md:hidden"
              style={{ color: 'var(--ds-text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {/* Avatar */}
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              backgroundColor: 'var(--ds-brand-bg-soft)',
              color: 'var(--ds-brand-text)',
            }}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-semibold leading-tight truncate"
              style={{ color: 'var(--ds-text-primary)' }}
            >
              {customerName}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--ds-text-secondary)' }}>
              {customerIdentifier}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Assignment control */}
          {onAssign && (
            <AssignmentPanel
              assignedTo={assignedTo}
              staff={staff}
              currentUserId={currentUserId ?? null}
              isAssigning={isAssigning}
              onAssign={(userId, staffMember) => onAssign(id, userId, staffMember)}
            />
          )}

          {onCreateOrder && (
            <button
              type="button"
              onClick={() => {
                setOrderSourceMessage(null);
                setOrderModalOpen(true);
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{
                color: 'var(--ds-brand-text)',
                border: '1px solid var(--ds-brand-border)',
                backgroundColor: 'var(--ds-brand-bg-soft)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              + Create Order
            </button>
          )}

          {activeCreditSale && onSendReminder && (
            <button
              type="button"
              onClick={() => onSendReminder(activeCreditSale.id)}
              disabled={isSendingReminder}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              style={{
                color: 'var(--ds-warning-text)',
                border: '1px solid var(--ds-warning-border)',
                backgroundColor: 'var(--ds-warning-bg)',
              }}
              onMouseEnter={(e) => {
                if (!isSendingReminder) e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {isSendingReminder ? 'Sending…' : 'Send Reminder'}
            </button>
          )}


        </div>
      </div>

      {/* ── WS connection banner ─────────────────────────────── */}
      {banner.show && (
        <div
          className="flex items-center gap-2 px-5 py-2 text-xs font-medium shrink-0"
          style={{
            backgroundColor: banner.bg,
            color: banner.text_color,
            borderBottom: `1px solid ${banner.border}`,
          }}
          role="status"
          aria-live="polite"
        >
          <svg
            className="h-3.5 w-3.5 animate-spin shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {banner.text}
        </div>
      )}

      {/* ── Messages area ────────────────────────────────────── */}
      <div
        className="relative flex-1 overflow-y-auto px-5 py-4 space-y-3"
        style={{
          backgroundColor: 'var(--ds-bg-sunken)',
          scrollbarWidth: 'thin',
        }}
        aria-label="Messages"
        role="log"
        aria-live="polite"
      >
        {/* Load earlier */}
        {hasMoreMessages && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={onLoadMoreMessages}
              disabled={isFetchingMoreMessages}
              className="text-xs font-medium disabled:opacity-50 transition-opacity"
              style={{ color: 'var(--ds-brand-text)' }}
            >
              {isFetchingMoreMessages ? 'Loading…' : 'Load earlier messages'}
            </button>
          </div>
        )}

        {/* Messages */}
        {renderMessages()}

        {/* Scheduled message bubbles */}
        {scheduledMessages.map((sm) => (
          <div key={sm.id} className="flex justify-end">
            <div
              className="relative max-w-[75%] rounded-2xl rounded-br-sm px-4 py-2.5"
              style={{
                backgroundColor: 'var(--ds-bg-elevated)',
                border: '1px dashed var(--ds-border-base)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
                {sm.content}
              </p>
              <div className="flex items-center justify-between gap-3 mt-1">
                <span
                  className="flex items-center gap-1 text-[10px]"
                  style={{ color: 'var(--ds-text-tertiary)' }}
                >
                  <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l3 3" />
                  </svg>
                  Sends {formatScheduledTime(sm.scheduledFor)}
                </span>
                {onCancelScheduledMessage && (
                  <button
                    type="button"
                    aria-label="Cancel scheduled message"
                    onClick={() => onCancelScheduledMessage(id, sm.id)}
                    className="text-[10px] font-medium transition-opacity hover:opacity-70"
                    style={{ color: 'var(--ds-danger-text)' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Inline order card ────────────────────────────────── */}
      {linkedOrder && (
        <InlineOrderCard
          order={linkedOrder}
          onViewDetails={onViewOrderDetails}
          collapsed={orderCollapsed}
          onToggleCollapse={() => setOrderCollapsed((prev) => !prev)}
          hasActiveCreditSale={hasActiveCreditSale}
          onMarkAsCredit={onMarkAsCredit}
          onConfirm={onConfirmOrder}
          isConfirming={isConfirmingOrder}
          onAddDetails={onCreateOrder ? () => { setOrderSourceMessage(null); setOrderModalOpen(true); } : undefined}
          onMarkPaid={onMarkOrderPaid}
          isMarkingPaid={isMarkingOrderPaid}
          orderIndex={orderIndex}
          totalOrders={totalOrders}
          onPrevOrder={onPrevOrder}
          onNextOrder={onNextOrder}
        />
      )}

      {/* ── Message input ────────────────────────────────────── */}
      <ChatInput
        onSend={(content) => onSendMessage(id, content)}
        disabled={false}
        isSending={isSending}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSchedule={onScheduleMessage ? (content, scheduledFor) => onScheduleMessage(id, content, scheduledFor) : undefined}
      />

      {/* ── Create Order modal ───────────────────────────────────── */}
      {onCreateOrder && (
        <CreateOrderModal
          isOpen={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          onSubmit={(payload) => {
            onCreateOrder(payload);
            setOrderModalOpen(false);
          }}
          isSubmitting={isCreatingOrder}
          customerName={customerName}
          customerIdentifier={customerIdentifier}
          conversationId={id}
          sourceMessage={orderSourceMessage}
        />
      )}
    </div>
  );
}
