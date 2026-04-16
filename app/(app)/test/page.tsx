'use client';

/**
 * /app/test — Integration Test Dev Tool
 *
 * Only available during development (guarded by NODE_ENV check).
 * Provides a UI for triggering each test flow manually and observing
 * live WebSocket events and store state.
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useWsStatus, useWsMessages } from '@/lib/hooks/useWebSocket';
import { useAppStore } from '@/store';
import {
  sendTestMessage,
  createTestOrder,
  confirmTestOrder,
  payTestOrder,
  completeTestOrder,
  initiateTestPayment,
  runFullFlow,
  type TestResult,
  type FullFlowResult,
} from '@/lib/test/testClient';

// ─── Mini log component ───────────────────────────────────────────────────────

interface LogEntry {
  id: number;
  ts: string;
  level: 'info' | 'success' | 'error' | 'warn';
  text: string;
  detail?: unknown;
}

let logSeq = 0;

function useLog() {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  function append(level: LogEntry['level'], text: string, detail?: unknown) {
    const entry: LogEntry = {
      id: ++logSeq,
      ts: new Date().toLocaleTimeString(),
      level,
      text,
      detail,
    };
    setEntries((prev) => [entry, ...prev].slice(0, 200));
  }

  return {
    entries,
    info: (t: string, d?: unknown) => append('info', t, d),
    success: (t: string, d?: unknown) => append('success', t, d),
    error: (t: string, d?: unknown) => append('error', t, d),
    warn: (t: string, d?: unknown) => append('warn', t, d),
    clear: () => setEntries([]),
  };
}

function appendResult<T>(
  log: ReturnType<typeof useLog>,
  label: string,
  result: TestResult<T>,
) {
  if (result.ok) {
    log.success(`${label} ✓ (${result.durationMs}ms)`, result.data);
  } else {
    log.error(`${label} ✗ (${result.durationMs}ms) — ${result.error}`, result);
  }
}

// ─── Status indicator ─────────────────────────────────────────────────────────

function WsStatusBadge() {
  const status = useWsStatus();
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    connected: 'success',
    connecting: 'warning',
    disconnected: 'default',
    error: 'danger',
  };
  return (
    <Badge variant={variants[status] ?? 'default'} dot>
      WS: {status}
    </Badge>
  );
}

// ─── Log panel ────────────────────────────────────────────────────────────────

function LogPanel({
  entries,
  onClear,
}: {
  entries: LogEntry[];
  onClear: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const levelClasses: Record<LogEntry['level'], string> = {
    info: 'text-gray-700',
    success: 'text-green-700',
    error: 'text-red-700',
    warn: 'text-amber-700',
  };

  const levelPrefix: Record<LogEntry['level'], string> = {
    info: '›',
    success: '✓',
    error: '✗',
    warn: '⚠',
  };

  return (
    <Card>
      <CardHeader
        title="Event log"
        description={`${entries.length} entries`}
        action={
          <Button size="sm" variant="ghost" onClick={onClear}>
            Clear
          </Button>
        }
      />
      <CardBody noPadding>
        <div className="h-72 overflow-y-auto font-mono text-xs p-3 space-y-0.5 bg-gray-950">
          {entries.length === 0 && (
            <p className="text-gray-500 italic">Waiting for events…</p>
          )}
          {entries.map((e) => (
            <div key={e.id} className={`flex gap-2 ${levelClasses[e.level]}`}>
              <span className="shrink-0 text-gray-500">{e.ts}</span>
              <span className="shrink-0">{levelPrefix[e.level]}</span>
              <span className="break-all">{e.text}</span>
              {e.detail !== undefined && (
                <span className="text-gray-400 truncate max-w-xs">
                  {JSON.stringify(e.detail)}
                </span>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </CardBody>
    </Card>
  );
}

// ─── WS event feed ────────────────────────────────────────────────────────────

function WsEventFeed({ log }: { log: ReturnType<typeof useLog> }) {
  const allMessages = useWsMessages('*', 50);
  const prevLen = useRef(0);

  useEffect(() => {
    if (allMessages.length > prevLen.current) {
      const newer = allMessages.slice(0, allMessages.length - prevLen.current);
      newer.forEach((m) => log.info(`[WS] ${m.type}`, m.payload));
    }
    prevLen.current = allMessages.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMessages.length]);

  return null; // side-effects only
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TestPage() {
  const log = useLog();

  // Per-flow loading
  const [msgLoading, setMsgLoading]         = useState(false);
  const [createLoading, setCreateLoading]   = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [payLoading, setPayLoading]         = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [fullLoading, setFullLoading]       = useState(false);

  // Form state
  const [msgSender, setMsgSender]     = useState('+2348012345678');
  const [msgBody, setMsgBody]         = useState('Hello, I want to place an order');
  const [msgChannel, setMsgChannel]   = useState('whatsapp');
  const [orderId, setOrderId]         = useState('');
  const [payOrderId, setPayOrderId]   = useState('');
  const [fullComplete, setFullComplete] = useState(false);
  const [lastCreatedOrderId, setLastCreatedOrderId] = useState<string | null>(null);

  // Store snapshot for display
  const conversations = useAppStore((s) => s.conversations);
  const orders        = useAppStore((s) => s.orders);
  const payments      = useAppStore((s) => s.payments);

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleSendMessage() {
    setMsgLoading(true);
    log.info(`[Flow 1] Sending inbound message via ${msgChannel} from ${msgSender}…`);
    const result = await sendTestMessage({ sender: msgSender, message: msgBody, channel: msgChannel });
    appendResult(log, '[Flow 1] sendTestMessage', result);
    setMsgLoading(false);
  }

  async function handleCreateOrder() {
    setCreateLoading(true);
    log.info('[Flow 2a] Creating order…');
    const result = await createTestOrder();
    appendResult(log, '[Flow 2a] createTestOrder', result);
    if (result.ok && result.data) {
      setLastCreatedOrderId(result.data.id);
      setOrderId(result.data.id);
      setPayOrderId(result.data.id);
      log.info(`Order ID captured: ${result.data.id}`);
    }
    setCreateLoading(false);
  }

  async function handleConfirmOrder() {
    const id = orderId.trim();
    if (!id) { log.warn('[Flow 2b] No order ID set'); return; }
    setConfirmLoading(true);
    log.info(`[Flow 2b] Confirming order ${id}…`);
    const result = await confirmTestOrder(id);
    appendResult(log, '[Flow 2b] confirmTestOrder', result);
    setConfirmLoading(false);
  }

  async function handlePayOrder() {
    const id = orderId.trim();
    if (!id) { log.warn('[Flow 2c] No order ID set'); return; }
    setPayLoading(true);
    log.info(`[Flow 2c] Paying order ${id}…`);
    const result = await payTestOrder(id);
    appendResult(log, '[Flow 2c] payTestOrder', result);
    setPayLoading(false);
  }

  async function handleCompleteOrder() {
    const id = orderId.trim();
    if (!id) { log.warn('[Flow 2d] No order ID set'); return; }
    setCompleteLoading(true);
    log.info(`[Flow 2d] Completing order ${id}…`);
    const result = await completeTestOrder(id);
    appendResult(log, '[Flow 2d] completeTestOrder', result);
    setCompleteLoading(false);
  }

  async function handleInitiatePayment() {
    const id = payOrderId.trim();
    if (!id) { log.warn('[Flow 3] No order ID set'); return; }
    setPaymentLoading(true);
    log.info(`[Flow 3] Initiating payment for order ${id}…`);
    const result = await initiateTestPayment(id);
    appendResult(log, '[Flow 3] initiateTestPayment', result);
    setPaymentLoading(false);
  }

  async function handleFullFlow() {
    setFullLoading(true);
    log.info('[Full Flow] Starting end-to-end test…');
    const results: FullFlowResult = await runFullFlow({
      complete: fullComplete,
      onStep: (step) => log.info(`[Full Flow] ${step}`),
    });
    appendResult(log, '[Full Flow] message',   results.message);
    if (results.order)     appendResult(log, '[Full Flow] create',   results.order);
    if (results.confirmed) appendResult(log, '[Full Flow] confirm',  results.confirmed);
    if (results.paid)      appendResult(log, '[Full Flow] pay',      results.paid);
    if (results.payment)   appendResult(log, '[Full Flow] payment',  results.payment);
    if (results.completed) appendResult(log, '[Full Flow] complete', results.completed);
    if (results.order?.ok && results.order.data) {
      setLastCreatedOrderId(results.order.data.id);
    }
    setFullLoading(false);
  }

  // ── Guard: dev-only ──────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Test page is not available in production.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* WS event mirror — side-effects only */}
      <WsEventFeed log={log} />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Integration Test Lab</h1>
          <p className="mt-1 text-sm text-gray-500">
            Dev-only · triggers real API calls against{' '}
            <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
              {process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'}
            </span>
          </p>
        </div>
        <WsStatusBadge />
      </div>

      {/* Store snapshot */}
      <div className="grid grid-cols-3 gap-4">
        {([
          ['Conversations', conversations.length],
          ['Orders',       orders.length],
          ['Payments',     payments.length],
        ] as [string, number][]).map(([label, count]) => (
          <Card key={label}>
            <CardBody>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label} in store</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 tabular-nums">{count}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* ── Flow 1 ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader
            title="Flow 1 — Inbound Message"
            description="POST /api/v1/webhooks/webhook · Expected: conversation.message via WS"
          />
          <CardBody>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Sender phone"
                  value={msgSender}
                  onChange={(e) => setMsgSender(e.target.value)}
                  placeholder="+2348012345678"
                />
                <Input
                  label="Channel"
                  value={msgChannel}
                  onChange={(e) => setMsgChannel(e.target.value)}
                  placeholder="whatsapp"
                />
              </div>
              <Input
                label="Message"
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                placeholder="Hello, I want to place an order"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSendMessage} disabled={msgLoading} loading={msgLoading}>
                Send Test Message
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* ── Flow 2: State machine ──────────────────────────────────── */}
        <Card>
          <CardHeader
            title="Flow 2 — Order State Machine"
            description="pending → confirmed → paid → completed"
          />
          <CardBody>
            <div className="space-y-3">
              <Input
                label="Order ID (auto-filled after Create)"
                placeholder="Set automatically or enter manually"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
              {lastCreatedOrderId && (
                <p className="text-xs text-green-700 bg-green-50 rounded px-2 py-1">
                  Last created: <span className="font-mono">{lastCreatedOrderId}</span>
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button onClick={handleCreateOrder} disabled={createLoading} loading={createLoading} variant="outline">
                  Create Order
                </Button>
                <Button onClick={handleConfirmOrder} disabled={confirmLoading || !orderId.trim()} loading={confirmLoading} variant="secondary">
                  Confirm
                </Button>
                <Button onClick={handlePayOrder} disabled={payLoading || !orderId.trim()} loading={payLoading}>
                  Mark Paid
                </Button>
                <Button onClick={handleCompleteOrder} disabled={completeLoading || !orderId.trim()} loading={completeLoading} variant="secondary">
                  Complete
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ── Flow 3 ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader
            title="Flow 3 — Initiate Payment"
            description="POST /api/v1/payments · Expected: payment_link returned"
          />
          <CardBody>
            <Input
              label="Order ID"
              value={payOrderId}
              onChange={(e) => setPayOrderId(e.target.value)}
              placeholder="Enter order ID"
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={handleInitiatePayment} disabled={paymentLoading || !payOrderId.trim()} loading={paymentLoading}>
                Initiate Payment
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* ── Full flow ──────────────────────────────────────────────── */}
        <Card>
          <CardHeader
            title="Full End-to-End Flow"
            description="Runs Flows 1 → 2a → 2b → 2c → 3 in sequence"
          />
          <CardBody>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={fullComplete}
                onChange={(e) => setFullComplete(e.target.checked)}
              />
              Also complete the order after paying
            </label>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleFullFlow} disabled={fullLoading} loading={fullLoading}>
                Run Full Flow
              </Button>
            </div>
          </CardBody>
        </Card>

      </div>

      {/* ── Error simulation ─────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Error Handling Checks"
          description="Verify graceful failures — no crashes, clear error messages"
        />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                log.warn('[Error Test] Sending invalid payload (missing required fields)…');
                const r = await sendTestMessage({ sender: '', message: '', channel: '' });
                appendResult(log, '[Error Test] empty payload', r);
              }}
            >
              Invalid Message Payload
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                log.warn('[Error Test] Fetching non-existent order…');
                const r = await confirmTestOrder('order-does-not-exist-000');
                appendResult(log, '[Error Test] bad order ID', r);
              }}
            >
              Wrong Order ID
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                log.warn('[Error Test] Initiating payment with non-existent order…');
                const r = await initiateTestPayment('order-does-not-exist-000', { amount: 1 });
                appendResult(log, '[Error Test] payment bad order', r);
              }}
            >
              Payment for Bad Order
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* ── Recent orders in store ────────────────────────────────────── */}
      {orders.length > 0 && (
        <Card>
          <CardHeader title="Orders in store" description="Live Zustand state — updates via WebSocket" />
          <CardBody noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['ID', 'Customer', 'Status', 'Total', 'Updated'].map((h) => (
                      <th key={h} className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.slice(0, 10).map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono">{o.id}</td>
                      <td className="px-4 py-2">{o.customerName}</td>
                      <td className="px-4 py-2">
                        <span className={[
                          'rounded px-1.5 py-0.5 font-semibold',
                          o.status === 'pending'   ? 'bg-amber-100 text-amber-700' :
                          o.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          o.status === 'paid'      ? 'bg-green-100 text-green-700' :
                          o.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700',
                        ].join(' ')}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono tabular-nums">{o.total} {o.currency}</td>
                      <td className="px-4 py-2 text-gray-400">{new Date(o.updatedAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ── Log panel ─────────────────────────────────────────────────── */}
      <LogPanel entries={log.entries} onClear={log.clear} />
    </div>
  );
}
