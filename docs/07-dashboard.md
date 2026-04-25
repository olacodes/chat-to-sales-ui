# Dashboard

## Overview
The home screen after login. Gives the agent an at-a-glance view of business health: key metrics, order pipeline, and a "Today's Focus" panel with the most urgent tasks. Time-of-day greeting personalises the experience.

---

## Key Files

| File | Purpose |
|------|---------|
| `app/(app)/dashboard/page.tsx` | Main dashboard page |
| `hooks/useDashboard.ts` | `useDashboardOverview()` — fetches summary metrics |
| `hooks/useOrders.ts` | `useOrders()` — used for orders-by-status breakdown |
| `components/dashboard/TodayFocusPanel.tsx` | Prioritised task list for the current day |
| `components/dashboard/SystemStatusCard.tsx` | Backend/service health indicators |
| `components/dashboard/WebhookTriggerCard.tsx` | Dev/test card for triggering webhooks |

---

## How It Works

### Greeting
- `getGreeting()` returns "Good morning" / "Good afternoon" / "Good evening" based on local hour
- Current date rendered using `Intl.DateTimeFormat` in `en-US` long format

### Metric cards (4 cards)
Fetched from `useDashboardOverview()` → `GET /api/v1/dashboard/overview`:

| Card | Field | Description |
|------|-------|-------------|
| Total Orders | `totalOrders` | All orders ever |
| Total Revenue | `totalRevenue` | Sum of paid order amounts |
| Active Conversations | `activeConversations` | Open or pending conversations |
| Conversion Rate | `conversionRate` | conversations → orders % |

- Skeleton shown while loading (4 animated placeholder cards)
- Error banner shown if the request fails (does not block the rest of the page)
- Quick-action chips in the header link to `/conversations` and `/orders`

### Orders by status (sidebar)
- Uses `useOrders()` (already cached from sidebar nav)
- Stacked horizontal bar shows each status as a proportional segment
- Legend below lists each status with count and percentage
- "View all →" links to `/orders`

### Today's Focus panel
- Implemented in `TodayFocusPanel` — a standalone component with its own data fetching
- Surfaces the most actionable items for the current day

### System status card
- `SystemStatusCard` — shows health of backend services (WebSocket, API, etc.)

---

## Data Model

```ts
interface DashboardOverview {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  activeConversations: number;
  conversionRate: number; // 0–100
}
```

---

## How to Test

### Metric cards
1. Go to `/dashboard`
2. Cards should show values matching actual data in the system
3. Disconnect network → error banner should appear, cards show 0

### Orders by status
1. Create orders in different statuses (via the Orders page)
2. Return to dashboard → stacked bar and legend counts should update

### Greeting
1. Change system clock to morning, afternoon, evening
2. Reload dashboard → greeting should update accordingly

### Conversion rate
1. Create 10 conversations and 3 orders linked to conversations
2. Conversion rate should show ~30%
