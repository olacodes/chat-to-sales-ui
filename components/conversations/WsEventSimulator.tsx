'use client';

import { useState } from 'react';
import { wsConnection } from '@/lib/websocket/connection';
import type { RealtimeEventType } from '@/lib/websocket/events';

/**
 * DEV-ONLY simulator panel.
 * Fires fake WebSocket messages directly into the wsConnection dispatcher
 * so the full real-time pipeline can be exercised without a live server.
 *
 * Remove or conditionally render this in production.
 */

interface SimulatorProps {
  /** The conversation ID to target for MessageReceived events */
  activeConversationId: string | null;
}

type SimEvent = {
  label: string;
  type: RealtimeEventType;
  buildPayload: (activeId: string | null) => object;
};

const SIM_EVENTS: SimEvent[] = [
  {
    label: '🆕 New conversation',
    type: 'conversation.started',
    buildPayload: () => ({
      id: `sim-conv-${Date.now()}`,
      customer_identifier: `+234801${Math.floor(Math.random() * 9_000_000 + 1_000_000)}`,
      customer_name: null,
      status: 'open',
      created_at: new Date().toISOString(),
    }),
  },
  {
    label: '💬 Incoming message',
    type: 'message.received',
    buildPayload: (activeId) => ({
      id: `sim-msg-${Date.now()}`,
      conversationId: activeId ?? 'conv-001',
      sender_role: 'user',
      content: `[SIM] Hey, I have a quick question about my order — ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
    }),
  },
  {
    label: '📦 Order state changed',
    type: 'order.updated',
    buildPayload: () => ({
      orderId: `ORD-${Math.floor(Math.random() * 999)}`,
      conversationId: null,
      status: 'confirmed',
      updatedAt: new Date().toISOString(),
    }),
  },
  {
    label: '💳 Payment confirmed',
    type: 'payment.confirmed',
    buildPayload: () => ({
      paymentId: `PAY-${Math.floor(Math.random() * 999)}`,
      orderId: `ORD-${Math.floor(Math.random() * 999)}`,
      amount: +(Math.random() * 300 + 20).toFixed(2),
      currency: 'USD',
      paidAt: new Date().toISOString(),
    }),
  },
];

export function WsEventSimulator({ activeConversationId }: SimulatorProps) {
  const [open, setOpen] = useState(false);
  const [lastFired, setLastFired] = useState<string | null>(null);

  function fire(event: SimEvent) {
    const payload = event.buildPayload(activeConversationId);
    // Inject directly into the message dispatcher using the wildcard listener pattern:
    // we simulate a received frame as a raw JSON string dispatched on the socket.
    // Since WebSocketClient.dispatchMessage is private, we use onMessage callbacks
    // already wired to the connection by firing through a synthetic message event.

    // Approach: call the onMessage listeners by dispatching a custom browser event
    // that the wsConnection module re-exports for testing.
    // Simpler approach: override by dispatching the message directly via internal WS.
    // Cleanest approach for a dev tool: re-export a `simulateMessage` helper.
    wsSimulate(event.type, payload);
    setLastFired(event.label);
    setTimeout(() => setLastFired(null), 1500);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Open WS simulator"
        className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-colors text-base"
        style={{ backgroundColor: 'var(--ds-bg-inverse)', color: 'var(--ds-text-inverse)' }}
      >
        ⚡
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-64 rounded-xl shadow-xl"
      style={{
        border: '1px solid var(--ds-border-base)',
        backgroundColor: 'var(--ds-bg-surface)',
        boxShadow: 'var(--ds-shadow-lg)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid var(--ds-border-subtle)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
          WS Simulator
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm transition-colors"
          style={{ color: 'var(--ds-text-tertiary)' }}
        >
          ✕
        </button>
      </div>

      <div className="p-3 space-y-2">
        {SIM_EVENTS.map((ev) => (
          <button
            key={ev.type}
            type="button"
            onClick={() => fire(ev)}
            className="w-full text-left rounded-lg px-3 py-2 text-xs transition-colors"
            style={{
              border: '1px solid var(--ds-border-subtle)',
              color: 'var(--ds-text-primary)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)';
              e.currentTarget.style.borderColor = 'var(--ds-border-base)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'var(--ds-border-subtle)';
            }}
          >
            {ev.label}
          </button>
        ))}
      </div>

      {lastFired && (
        <div
          className="px-4 py-2 text-[10px]"
          style={{
            borderTop: '1px solid var(--ds-border-subtle)',
            color: 'var(--ds-success-text)',
          }}
        >
          ✓ Fired: {lastFired}
        </div>
      )}
    </div>
  );
}

// ─── Internal simulation helper ───────────────────────────────────────────────

/**
 * Pushes a synthetic message directly to all onMessage listeners registered
 * on wsConnection, bypassing the actual WebSocket transport.
 * This works because wsConnection.onMessage registers callbacks stored in a Map;
 * We trigger them by reaching into the public send path or by exposing a helper.
 *
 * The cleanest approach: add a `dispatchForTesting` method to WebSocketClient.
 * We expose that here so the simulator and tests can use it.
 */
function wsSimulate(type: string, payload: object): void {
  // Access the internal dispatcher via the exposed testing helper (see client.ts).
  // If the method isn't available (e.g. production build strips it), fail silently.
  const client = wsConnection as unknown as {
    dispatchForTesting?: (raw: string) => void;
  };
  if (typeof client.dispatchForTesting === 'function') {
    client.dispatchForTesting(
      JSON.stringify({ type, payload, timestamp: new Date().toISOString() }),
    );
  } else {
    console.warn('[WsSimulator] dispatchForTesting not available on wsConnection');
  }
}
