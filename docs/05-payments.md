# Payments

## Overview
Read-only view of all payment transactions linked to orders. Shows collected revenue, pending amounts, failed and refunded transactions. Supports filtering by status and searching by payment ID, reference, or linked order ID.

---

## Key Files

| File | Purpose |
|------|---------|
| `app/(app)/payments/page.tsx` | Payments table with summary cards, filter tabs, search |
| `hooks/usePayments.ts` | `usePayments()` — fetches `GET /api/v1/payments` |

---

## How It Works

### Payment list
1. `usePayments()` fetches all payments for the tenant
2. Four summary cards at the top: Total Collected, Pending, Failed, Refunded
3. Filter tabs: All / Paid / Pending / Failed / Refunded
4. Search by payment ID, linked order ID, or payment reference (provider ref e.g. Paystack ref)
5. Table columns: Payment ID (truncated), Reference, Status badge, Amount, Linked Order, Date

### Amount display
- Paid → normal text color
- Failed → danger red color
- Refunded → grey with strikethrough

### Linked order
- Each row links back to `/orders` via the order ID
- Clicking navigates to the Orders page (full order filter not implemented yet — navigates to list)

### Date shown
- Uses `paidAt` if available (actual payment timestamp)
- Falls back to `createdAt` if `paidAt` is null (e.g. pending payments)

### No write actions
Payments are created by the backend when order status transitions to `paid`. There are no create/update actions on the frontend for payments.

---

## Data Model

```ts
type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

interface Payment {
  id: string;
  orderId: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  reference: string | null; // external payment provider reference
  paidAt: string | null;
  createdAt: string;
}
```

---

## How to Test

### Summary cards
1. Go to `/payments`
2. Summary cards should show totals matching the table data below

### Filter tabs
1. Click **Paid** tab → only paid transactions shown
2. Click **Pending** → only pending shown
3. Click **All** → full list returns

### Search
1. Search for a partial payment ID → matching rows shown
2. Search for an order ID or reference → rows with that value appear
3. Clear search → all rows return (within active tab filter)

### Amount styling
1. Find a refunded payment → amount should be grey with strikethrough
2. Find a failed payment → amount should be in red
