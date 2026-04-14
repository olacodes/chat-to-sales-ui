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
    label: '💬 Incoming message',
    type: 'message.received',
    buildPayload: (activeId) => ({
      id: `sim-msg-${Date.now()}`,
      conversationId: activeId ?? 'conv-001',
      role: 'user',
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
        className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition-colors text-base"
      >
        ⚡
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-64 rounded-xl border border-gray-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
        <span className="text-xs font-semibold text-gray-700">WS Simulator</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-gray-400 hover:text-gray-600 text-sm"
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
            className="w-full text-left rounded-lg border border-gray-100 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-colors"
          >
            {ev.label}
          </button>
        ))}
      </div>

      {lastFired && (
        <div className="border-t border-gray-100 px-4 py-2 text-[10px] text-green-600">
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
