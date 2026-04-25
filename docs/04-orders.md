# Orders

## Overview
Tracks all customer orders across their full lifecycle from initial inquiry to completion. Agents can advance order status with one-click actions. The order is also surfaced inline inside the relevant conversation via `InlineOrderCard`.

---

## Key Files

| File | Purpose |
|------|---------|
| `app/(app)/orders/page.tsx` | Orders table: filter tabs, search, date range, status actions |
| `hooks/useOrders.ts` | `useOrders`, `useConfirmOrder`, `usePayOrder`, `useCompleteOrder` |
| `components/conversations/InlineOrderCard.tsx` | Compact order card inside ChatWindow showing status, items, progress bar |
| `store/useAppStore.ts` | `orders` array — populated by WebSocket `OrderStateChanged` events |

---

## How It Works

### Order list page
1. `useOrders()` fetches all orders → `GET /api/v1/orders`
2. Results stored in React Query cache
3. Filter tabs at the top: All / Inquiry / Pending / Confirmed / Paid / Completed / Cancelled
4. Search by order ID or customer name
5. Date range filter (From / To) with a "Clear" button when active
6. Footer shows "Showing X of Y orders" with active filter labels

### Order lifecycle actions
Actions appear in the rightmost column of the table, one at a time based on current status:

| Current Status | Available Action | Result |
|----------------|-----------------|--------|
| `pending` | **Confirm** | `POST /api/v1/orders/{id}/confirm` → `confirmed` |
| `confirmed` | **Mark Paid** | `POST /api/v1/orders/{id}/pay` → `paid` |
| `paid` | **Complete** | `POST /api/v1/orders/{id}/complete` → `completed` |
| `completed` / `cancelled` | — | No action |

All action buttons disable while their mutation is pending to prevent double-submits.

### Inline order card (in conversations)
- Shown inside `ChatWindow` when a conversation has a linked order
- Displays: order ID (truncated), status badge, total amount, item list, step progress bar
- Collapsible — toggle button in the header
- Step progress bar: Inquiry → Pending → Confirmed → Paid → Done (cancelled shown as red text)
- "Mark Credit" button appears when status is `confirmed` or `completed` and no credit sale exists yet (see `06-credit-sales.md`)
- "Details →" button opens the order detail drawer/modal

### Dashboard integration
- `useDashboard` provides `totalOrders`, `pendingOrders` counts for the metric cards
- "Orders by status" sidebar card on the dashboard uses `useOrders()` directly and renders a stacked bar

---

## Data Model

```ts
type OrderStatus = 'inquiry' | 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled';

interface Order {
  id: string;
  tenantId: string;
  conversationId: string | null;
  customerName: string;
  status: OrderStatus;
  total: number;
  currency: string;
  items: OrderItem[];
  createdAt: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}
```

---

## How to Test

### Order list and filters
1. Go to `/orders`
2. Click each status tab — counts in tab badges should match the rows shown
3. Search for a customer name — list should filter live
4. Set a date range — list should filter to that window
5. Click "Clear" — all filters reset

### Lifecycle actions
1. Find a `pending` order → click **Confirm** → status badge changes to Confirmed
2. Find a `confirmed` order → click **Mark Paid** → status changes to Paid
3. Find a `paid` order → click **Complete** → status changes to Completed

### Inline order card
1. Open a conversation that has a linked order
2. The InlineOrderCard should appear above the chat input
3. Click the collapse chevron → card shrinks to header only
4. Expand again → shows item count and progress bar
