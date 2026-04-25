# Credit Sales (Debt Tracker)

## Overview
Tracks orders where the customer took goods on credit and hasn't paid yet. An agent explicitly marks an order as a credit sale. The system then surfaces the debt as a badge on the conversation list, a "Send Reminder" button inside the conversation, and a dedicated dashboard for managing all outstanding credit sales.

---

## Key Files

| File | Purpose |
|------|---------|
| `app/(app)/credit/page.tsx` | Credit sales dashboard: tabbed table with Remind / Settle / Dispute actions |
| `hooks/useCreditSales.ts` | `useCreditSales`, `useCreateCreditSale`, `useSettleCreditSale`, `useDisputeCreditSale`, `useSendCreditReminder` |
| `lib/api/endpoints/credit-sales.ts` | API adapter: maps `CreditSaleOut` → `CreditSale` |
| `components/conversations/InlineOrderCard.tsx` | "Mark Credit" button in the order card header |
| `components/conversations/ChatWindow.tsx` | "Send Reminder" button in conversation header |
| `app/(app)/conversations/layout.tsx` | Fetches active credit sales → builds `debtConversationIds` set |
| `components/conversations/ConversationListItem.tsx` | ₦ debt badge |
| `store/useAppStore.ts` | `CreditSale` type, `CreditSaleStatus` type |

### Backend
| File | Purpose |
|------|---------|
| `chatToSales/app/modules/credit_sales/models.py` | `CreditSale` SQLAlchemy model |
| `chatToSales/app/modules/credit_sales/router.py` | REST endpoints |
| `chatToSales/alembic/versions/010_add_credit_sales.py` | Database migration |

---

## How It Works

### 1. Marking an order as a credit sale
1. Open a conversation with a linked order
2. Order must be `confirmed` or `completed` with no existing credit sale
3. "Mark Credit" button appears in the `InlineOrderCard` header
4. Clicking calls `onMarkAsCredit(orderId, total)` → page calls `createCreditSale({ order_id, conversation_id, amount, currency, customer_name })`
5. `POST /api/v1/credit-sales/` creates the record in the database

### 2. Debt badge on conversation list
- Layout fetches `useCreditSales('active')` on mount
- Builds `debtConversationIds = new Set(creditSales.map(c => c.conversationId))`
- Passed as prop to `ConversationList` → `ConversationListItem`
- Amber ₦ badge shown when `hasDebt = debtConversationIds.has(conv.id)`

### 3. Send Reminder button
- In `[id]/page.tsx`: `activeCreditSale = creditSales.find(c => c.conversationId === id)`
- If found, `ChatWindow` shows an amber **"Send Reminder"** button in the header
- Clicking calls `sendCreditReminder(creditSaleId)` → `POST /api/v1/credit-sales/{id}/remind`
- Backend sends a reminder message into the conversation thread
- `remindersSent` count is patched in React Query cache without a full refetch

### 4. Credit sales dashboard (`/credit`)
- Tabbed view: **Active** / **Settled** / **Disputed** / **Written off**
- Each tab fetches `useCreditSales(tabKey)` independently
- Table columns: Customer, Amount, Age (days since creation, red if > 14), Status, Reminders sent, Actions
- Actions per active row:
  - **Remind** → `POST /api/v1/credit-sales/{id}/remind`
  - **Settled** → `POST /api/v1/credit-sales/{id}/settle`
  - **Dispute** → `POST /api/v1/credit-sales/{id}/dispute`
- Settled/disputed records move to their respective tabs

### Status lifecycle
```
active → settled   (customer paid)
active → disputed  (agent marks as disputed)
active → written_off (not yet implemented in UI)
```

---

## Data Model

```ts
type CreditSaleStatus = 'active' | 'settled' | 'disputed' | 'written_off';

interface CreditSale {
  id: string;
  tenantId: string;
  orderId: string;
  conversationId: string | null;
  customerName: string;
  amount: number;
  currency: string;
  dueDate: string | null;
  status: CreditSaleStatus;
  reminderIntervalDays: number;  // default: 3
  maxReminders: number;          // default: 5
  remindersSent: number;
  lastRemindedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

## How to Test

### End-to-end flow
1. Open a conversation with a `confirmed` or `completed` linked order
2. In the InlineOrderCard header, click **"Mark Credit"**
3. Go to `/credit` → should see the record in the **Active** tab
4. Return to conversation list → ₦ badge should appear on that conversation
5. Re-open the conversation → **"Send Reminder"** button should appear in the header
6. Click **"Send Reminder"** → reminder message should appear in the chat thread
7. On the `/credit` dashboard, click **"Remind"** again → reminder count increments
8. Click **"Settled"** → record moves to the Settled tab; debt badge disappears from conversation list

### Edge cases
| Scenario | Expected |
|----------|---------|
| Order is `pending` | "Mark Credit" button NOT shown |
| Credit sale already exists for this order | "Mark Credit" button NOT shown |
| No linked order on conversation | "Send Reminder" button NOT shown |
| Credit sale has no `conversationId` | Debt badge NOT shown on conversation list |
