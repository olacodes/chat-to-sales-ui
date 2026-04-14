# Integration Testing Guide

ChatToSales Frontend ↔ Backend Integration

---

## Prerequisites

| Requirement | Value |
|---|---|
| Frontend | `http://localhost:3000` — `npm run dev` |
| Backend | `http://localhost:8000` |
| WebSocket | `ws://localhost:8000/ws/{tenant_id}` |
| Tenant ID | `tenant-abc-123` (set in `.env.local`) |

Make sure `.env.local` contains:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_TENANT_ID=tenant-abc-123
```

---

## Opening the Test Lab UI

Navigate to **http://localhost:3000/test** — the integration test lab.

The page shows:
- Live WebSocket connection status badge
- Store snapshot (conversations / orders / payments count)
- One card per test flow
- Event log panel (live WS events + API call results)

> The `/test` page guards itself with `NODE_ENV !== 'production'` so it is never accessible in production builds.

---

## Debugging: Browser DevTools

Open **DevTools → Console** and filter to `[api]`, `[ws]`, or `[store]`.

All debug logs are emitted only in `NODE_ENV=development`.

| Prefix | What it shows |
|---|---|
| `[api] → POST /api/v1/…` | Outgoing HTTP request |
| `[api] ← POST /api/v1/… [202] (12ms)` | Successful response |
| `[api] ✗ POST /api/v1/… [422] (8ms)` | Error response |
| `[ws] status disconnected → connecting` | Connection state change |
| `[ws] connected ws://localhost:8000/ws/tenant-abc-123` | Successfully connected |
| `[ws] event conversation.message {…}` | Received WS event |
| `[ws] error` | Socket error |
| `[store] addMessage {id, role}` | Zustand store mutation triggered by WS |
| `[store] updateOrder {id, status}` | Order state change applied to store |

---

## Flow 1 — Message Ingestion

**Purpose:** Verify that an inbound customer message creates/updates a Conversation and appears in the UI without a refresh.

### Manual curl

```bash
curl -X POST http://localhost:8000/api/v1/webhooks/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp",
    "sender": "+2348012345678",
    "message": "Hello, I want to place an order",
    "tenant_id": "tenant-abc-123"
  }'
```

### Using the Test Lab

Click **"Send Test Message"** in the Flow 1 card.

### Expected results

1. API returns `202 Accepted`
2. Console: `[api] ← POST /api/v1/webhooks/webhook [202]`
3. Backend publishes event → WebSocket emits `conversation.message` (or `conversation.started`)
4. Console: `[ws] event conversation.message {…}`
5. Console: `[store] addMessage {…}` or `[store] addConversation {…}`
6. **Conversations page** shows the new message — no refresh needed

### Common issues

| Symptom | Likely cause | Fix |
|---|---|---|
| API returns 4xx | Wrong `tenant_id` | Check `.env.local` and backend tenant config |
| No WS event after 202 | Backend event bus not running | Check backend logs / message broker |
| WS says `error`/`disconnected` | Wrong WS URL or CORS | Check `NEXT_PUBLIC_WS_URL` and backend CORS origins |
| Conversation appears but no message | `conversation.started` received, not `conversation.message` | Normal for first message; message is embedded in conversation payload |

---

## Flow 2 — Order State Machine

**Purpose:** Verify the full order lifecycle: `pending → confirmed → paid → completed`.

### Step 2a — Create order

```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "cust-test-001",
    "customer_name": "Test Customer",
    "conversation_id": null,
    "items": [{"product_id": "prod-001", "name": "Test Shoes", "quantity": 2, "unit_price": 15000}],
    "currency": "USD"
  }'
```

Note the `id` in the response. All subsequent calls use it.

### Step 2b — Confirm order

```bash
curl -X POST http://localhost:8000/api/v1/orders/{order_id}/confirm
```

### Step 2c — Pay order

```bash
curl -X POST http://localhost:8000/api/v1/orders/{order_id}/pay
```

### Step 2d — Complete order (optional)

```bash
curl -X POST http://localhost:8000/api/v1/orders/{order_id}/complete
```

### Using the Test Lab

1. Click **"Create Order"** — the Order ID is auto-filled in the flow 2 card
2. Click **"Confirm"** / **"Mark Paid"** / **"Complete"** in sequence

### Expected results

| Step | API status | WS event | Store action | Orders page |
|---|---|---|---|---|
| Create | 201 | `order.created` | `addOrder` | New row with "Pending" badge |
| Confirm | 200 | `order.updated` | `updateOrder` | Badge changes to "Confirmed" |
| Pay | 200 | `order.updated` | `updateOrder` | Badge changes to "Paid" |
| Complete | 200 | `order.updated` | `updateOrder` | Badge changes to "Completed" |

### Common issues

| Symptom | Likely cause |
|---|---|
| 404 on confirm/pay | Order ID not found; verify from create response |
| Status badge doesn't update | WS `order.updated` not received; check backend event emission |
| Order appears with unknown status | Backend returning status not in `['pending','confirmed','paid','completed','cancelled']` — normalised by `ORDER_STATUS_MAP` in `services.ts` |

---

## Flow 3 — Payment Initiation

**Purpose:** Verify that initiating a payment returns a `payment_link` and the payment appears in the Payments UI.

### Request

```bash
curl -X POST http://localhost:8000/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "{order_id}",
    "amount": 30000,
    "currency": "USD",
    "method": "Card"
  }'
```

### Using the Test Lab

Enter the Order ID in the **Flow 3** card and click **"Initiate Payment"**.

### Expected results

1. API returns 201
2. Response contains `payment_link` (may be `null` for test/sandbox backends that skip gateway)
3. Console: `[store] addPayment {id, status}`
4. **Payments page** shows the new row with "Pending" status and the link (if present)

### Checking the payment_link

If `payment_link` is returned:
- The link is shown in the test lab log
- On the Payments page, it appears in the "Payment Link" column as a clickable URL

---

## Flow 4 — Real-Time Validation

**Purpose:** Confirm that no page refresh is ever needed.

### Procedure

1. Open the browser on **http://localhost:3000/orders** (keep it visible)
2. In a second tab, open **http://localhost:3000/test**
3. Click "Create Order" → watch the Orders page update immediately
4. Click "Confirm" → badge changes without refresh
5. Click "Mark Paid" → badge changes again

To run all three flows in one click: use **"Run Full Flow"** in the test lab.

### Checklist

- [ ] WebSocket badge shows **connected** before starting
- [ ] Store counters (Orders / Payments) increment after each create call
- [ ] Orders table updates within ~1 second of clicking action buttons
- [ ] No browser console errors

---

## Error Handling Checks

The Test Lab has three error scenario buttons:

### Invalid message payload (empty sender + message)

- Expected: API returns `422 Unprocessable Entity`
- Frontend: Error message displayed in test log, no crash

### Wrong Order ID (`confirmTestOrder('order-does-not-exist-000')`)

- Expected: API returns `404 Not Found`
- Frontend: Error captured in `TestResult.error`, logged as `[testClient] ✗`

### Payment for bad order

- Expected: API returns `404` or `422`
- Frontend: Gracefully handled, error displayed

---

## Architecture Overview

```
Customer message
      │
      ▼
POST /api/v1/webhooks/webhook   ← Flow 1 entry point
      │
      ▼
Backend event bus (Redis/RabbitMQ/etc.)
      │                         │
      ▼                         ▼
Conversation DB           WebSocket push
                               │
                       ws://localhost:8000/ws/tenant-abc-123
                               │
                      WebSocketClient (client.ts)
                               │
                       wsConnection.onMessage()
                               │
                      WebSocketProvider.tsx
                               │
                       Zustand store mutations
                               │
                    React components re-render
```

---

## File Reference

| File | Purpose |
|---|---|
| `lib/test/testClient.ts` | Test helper: `sendTestMessage`, `createTestOrder`, etc. |
| `app/test/page.tsx` | Dev-only test lab UI |
| `lib/api/client.ts` | HTTP client with `[api]` debug logs |
| `lib/websocket/client.ts` | WS client with `[ws]` debug logs |
| `components/providers/WebSocketProvider.tsx` | Bridges WS events to Zustand with `[store]` logs |
| `lib/api/services.ts` | Domain services + `ORDER_STATUS_MAP` normaliser |
| `.env.local` | `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_TENANT_ID` |

---

## Quick Issue Checklist

```
✗ WS status shows "error"
  → Is the backend running? curl http://localhost:8000/health
  → Does the backend support ws://localhost:8000/ws/{tenant_id}?
  → Check CORS: backend must allow ws:// from http://localhost:3000

✗ API calls return CORS error in browser console
  → Backend must include Access-Control-Allow-Origin: http://localhost:3000
  → Or use a CORS-proxy / Next.js rewrites (next.config.mjs)

✗ WS connected but UI never updates after API calls
  → Backend may not be publishing events after the API call
  → Check backend logs for event emission
  → Verify tenant_id matches between WS connection and API payloads

✗ "Cannot destructure property 'variant' of STATUS_BADGE[order.status]"
  → Backend returning an unexpected order status string
  → Add it to ORDER_STATUS_MAP in lib/api/services.ts

✗ Order created via API but not appearing in Orders page
  → WS event 'order.created' not received — check ws logs
  → The store is only updated via WS; REST calls in the Orders page
     manually call addOrder() but WS-triggered creates go through
     WebSocketProvider → addOrder

✗ payment_link is null
  → Normal for backends without a real payment gateway configured
  → Link will be non-null in production or when a test gateway is configured
```
