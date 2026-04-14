/**
 * ChatToSales — Integration Test Client
 *
 * Thin wrappers around the real service layer that give each test flow a
 * stable, documented entry point. Everything goes through the same HTTP
 * client used in production — no mocking, no stubs.
 *
 * Import in tests or the /test dev-tool page:
 *   import { sendTestMessage, createTestOrder, … } from '@/lib/test/testClient';
 */

import { webhookService, orderService, paymentService } from '@/lib/api/services';
import type { Conversation, Order, Payment } from '@/store';

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_TENANT_ID =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_TENANT_ID) || 'tenant-abc-123';

const DEFAULT_SENDER = '+2348012345678';
const DEFAULT_CURRENCY = 'USD';

// ─── Result shapes ────────────────────────────────────────────────────────────

export interface TestResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  durationMs: number;
}

async function run<T>(label: string, fn: () => Promise<T>): Promise<TestResult<T>> {
  const t0 = performance.now();
  try {
    const data = await fn();
    const durationMs = Math.round(performance.now() - t0);
    console.info(`[testClient] ✓ ${label} (${durationMs}ms)`, data);
    return { ok: true, data, durationMs };
  } catch (err) {
    const durationMs = Math.round(performance.now() - t0);
    const error = err instanceof Error ? err.message : String(err);
    console.error(`[testClient] ✗ ${label} (${durationMs}ms) —`, error, err);
    return { ok: false, error, durationMs };
  }
}

// ─── Flow 1: Message ingestion ────────────────────────────────────────────────

export interface SendTestMessageOptions {
  /** Outgoing channel identifier. Default: 'whatsapp' */
  channel?: string;
  /** Sender phone number. Default: '+2348012345678' */
  sender?: string;
  /** Message body */
  message?: string;
  /** Tenant ID. Default: NEXT_PUBLIC_TENANT_ID */
  tenantId?: string;
}

/**
 * Flow 1 — POST /api/v1/webhooks/webhook
 *
 * Simulates an inbound customer message. The backend publishes an event, the
 * conversation service stores it, and the WebSocket pushes `conversation.message`
 * back to connected clients.
 *
 * Expected: API returns 202, UI updates without a page refresh.
 */
export async function sendTestMessage(
  options: SendTestMessageOptions = {},
): Promise<TestResult<void>> {
  const {
    channel = 'whatsapp',
    sender = DEFAULT_SENDER,
    message = 'Hello, I want to place an order',
    tenantId = DEFAULT_TENANT_ID,
  } = options;

  return run('sendTestMessage', () =>
    webhookService.sendInboundMessage({ channel, sender, message, tenant_id: tenantId }),
  );
}

// ─── Flow 2: Order creation ───────────────────────────────────────────────────

export interface CreateTestOrderOptions {
  conversationId?: string | null;
  customerId?: string;
  customerName?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  currency?: string;
}

/**
 * Flow 2a — POST /api/v1/orders
 *
 * Creates an order in the backend. The backend should emit `order.created`
 * over WebSocket, causing the Orders page to update in real-time.
 *
 * Expected: order returned with status 'pending'.
 */
export async function createTestOrder(options: CreateTestOrderOptions = {}): Promise<TestResult<Order>> {
  const {
    conversationId = null,
    customerId = 'cust-test-001',
    customerName = 'Test Customer',
    productId = 'prod-test-001',
    productName = 'Test Shoes',
    quantity = 2,
    unitPrice = 15000,
    currency = DEFAULT_CURRENCY,
  } = options;

  return run('createTestOrder', () =>
    orderService.create({
      conversation_id: conversationId,
      customer_id: customerId,
      customer_name: customerName,
      items: [{ product_id: productId, name: productName, quantity, unit_price: unitPrice }],
      currency,
    }),
  );
}

// ─── Flow 2b: Confirm order ───────────────────────────────────────────────────

/**
 * Flow 2b — POST /api/v1/orders/{id}/confirm
 *
 * Advances an order from 'pending' → 'confirmed'.
 * Expected: WebSocket emits `order.updated`, Orders page updates.
 */
export async function confirmTestOrder(orderId: string): Promise<TestResult<Order>> {
  return run(`confirmTestOrder(${orderId})`, () => orderService.confirm(orderId));
}

// ─── Flow 2c: Pay order ───────────────────────────────────────────────────────

/**
 * Flow 2c — POST /api/v1/orders/{id}/pay
 *
 * Advances an order from 'confirmed' → 'paid'.
 * Expected: WebSocket emits `order.updated`, Orders page updates.
 */
export async function payTestOrder(orderId: string): Promise<TestResult<Order>> {
  return run(`payTestOrder(${orderId})`, () => orderService.pay(orderId));
}

// ─── Flow 2d: Complete order ──────────────────────────────────────────────────

/**
 * Flow 2d — POST /api/v1/orders/{id}/complete
 *
 * Advances an order from 'paid' → 'completed'.
 */
export async function completeTestOrder(orderId: string): Promise<TestResult<Order>> {
  return run(`completeTestOrder(${orderId})`, () => orderService.complete(orderId));
}

// ─── Flow 3: Payment initiation ───────────────────────────────────────────────

export interface InitiateTestPaymentOptions {
  /** Amount in smallest currency unit (e.g. cents). */
  amount?: number;
  currency?: string;
  method?: string;
}

/**
 * Flow 3 — POST /api/v1/payments
 *
 * Initiates a payment for the given order. The backend creates a payment
 * record and (for real gateways) returns a hosted `payment_link`.
 *
 * Expected: payment returned with a `paymentLink` value, appears in Payments UI.
 */
export async function initiateTestPayment(
  orderId: string,
  options: InitiateTestPaymentOptions = {},
): Promise<TestResult<Payment>> {
  const { amount = 30000, currency = DEFAULT_CURRENCY, method = 'Card' } = options;

  return run(`initiateTestPayment(${orderId})`, () =>
    paymentService.initiate({ order_id: orderId, amount, currency, method }),
  );
}

// ─── Flow: Full end-to-end ────────────────────────────────────────────────────

export interface FullFlowOptions {
  /** Optional conversationId to attach the order to. */
  conversationId?: string | null;
  /** If true, also completes the order after paying. Default: false. */
  complete?: boolean;
  onStep?: (step: string) => void;
}

export interface FullFlowResult {
  message: TestResult<void>;
  order?: TestResult<Order>;
  confirmed?: TestResult<Order>;
  paid?: TestResult<Order>;
  completed?: TestResult<Order>;
  payment?: TestResult<Payment>;
}

/**
 * Runs Flows 1–3 in sequence, returning all intermediate results.
 *
 * Use the `onStep` callback to stream progress to the UI.
 */
export async function runFullFlow(options: FullFlowOptions = {}): Promise<FullFlowResult> {
  const { conversationId = null, complete = false, onStep = () => {} } = options;
  const results: FullFlowResult = {} as FullFlowResult;

  // Step 1 — inbound message
  onStep('Sending inbound message…');
  results.message = await sendTestMessage({ message: 'Full flow test — please create an order' });

  // Step 2a — create order
  onStep('Creating order…');
  results.order = await createTestOrder({ conversationId });
  if (!results.order.ok || !results.order.data) return results;
  const orderId = results.order.data.id;

  // Step 2b — confirm
  onStep(`Confirming order ${orderId}…`);
  results.confirmed = await confirmTestOrder(orderId);
  if (!results.confirmed.ok) return results;

  // Step 2c — pay
  onStep(`Paying order ${orderId}…`);
  results.paid = await payTestOrder(orderId);
  if (!results.paid.ok) return results;

  // Step 3 — initiate payment record
  onStep(`Initiating payment for order ${orderId}…`);
  results.payment = await initiateTestPayment(orderId, {
    amount: results.order.data.total,
  });

  // Optional: complete
  if (complete) {
    onStep(`Completing order ${orderId}…`);
    results.completed = await completeTestOrder(orderId);
  }

  onStep('Done.');
  return results;
}
