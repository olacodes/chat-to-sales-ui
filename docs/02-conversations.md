# Conversations

## Overview
The central workspace. Shows all incoming customer conversations with real-time updates. Agents can filter by assignment, search, and see unread counts. Selecting a conversation opens the chat panel on the right (desktop) or full screen (mobile).

---

## Key Files

| File | Purpose |
|------|---------|
| `app/(app)/conversations/layout.tsx` | Two-panel layout: list + chat. Fetches conversations, credit sales, handles navigation |
| `app/(app)/conversations/page.tsx` | Empty state shown on desktop when no conversation is selected |
| `app/(app)/conversations/[id]/page.tsx` | Active conversation detail — wires all hooks to ChatWindow |
| `components/conversations/ConversationList.tsx` | Tabs, search, sorted list, load more |
| `components/conversations/ConversationListItem.tsx` | Single row: avatar, name, last message, unread badge, debt badge, assignee |
| `hooks/useConversations.ts` | React Query hooks: `useConversations`, `useStaff`, `useAssignConversation` |
| `store/useAppStore.ts` | `unreadCounts`, `activeConversationId`, `setActiveConversation`, `resetUnread` |
| `lib/hooks/useConversationsRealtime.ts` | WebSocket event → Zustand store updates |

---

## How It Works

### Conversation list
1. `useConversations()` fetches paginated conversations from `GET /api/v1/conversations`
2. Tabs filter the list:
   - **Unassigned** — `assignedTo === null`
   - **Mine** — `assignedTo.id === currentUserId`
   - **All** — no filter
3. Tab counts are computed before the search filter
4. Search filters by `customerName`, `customerIdentifier`, and `lastMessage`
5. List sorted by `lastMessageAt` descending (newest first)
6. A "Load more" button appears when `hasNextPage` is true (infinite scroll via React Query)

### Unread counts
- Stored in Zustand (`unreadCounts` map: `conversationId → number`)
- Incremented by WebSocket `new_message` events (via `useConversationsRealtime`)
- Reset to 0 when the conversation is opened (`resetUnread(id)`)
- Persists across React Query refetches because it lives in Zustand, not React Query cache

### Status dot on avatar
- Green dot = `open`, Amber = `pending`, Grey = `resolved`
- Maps from `ConversationStatus` using `statusDotColor` in `ConversationListItem`

### Debt badge (₦)
- Amber ₦ badge shown when the conversation has an active credit sale
- `debtConversationIds: Set<string>` built from `useCreditSales('active')` in the layout
- Passed down as `hasDebt` prop to each `ConversationListItem`

### Assignee display
- Shows "Assigned: Alice" in muted text at the bottom-right of each item
- Derived from `conversation.assignedTo.displayName ?? email.split('@')[0]`
- Tooltip shows full name + email on hover

### Mobile layout
- `useSelectedLayoutSegment()` detects when a conversation ID is in the URL
- List hidden on mobile when a conversation is open (`showingChat` flag)
- Back button in `ChatWindow` navigates to `/conversations`

---

## Data Model

```ts
interface Conversation {
  id: string;
  tenantId: string;
  customerName: string;
  customerIdentifier: string; // phone number or handle
  status: 'open' | 'pending' | 'resolved';
  assignedTo: StaffMember | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number; // from Zustand, not API
}
```

---

## How to Test

### Tabs
1. Open `/conversations`
2. Switch between Unassigned / Mine / All tabs
3. Counts in tab badges should update correctly

### Search
1. Type a customer name in the search box → list filters live
2. Clear search → full tab list returns

### Unread badge
1. With another client, send a message to a conversation that isn't currently open
2. The conversation in the list should show a blue unread count badge
3. Open the conversation → badge disappears

### Debt badge
1. Mark an order as a credit sale (see `06-credit-sales.md`)
2. Return to conversation list → ₦ badge should appear on that conversation

### Load more
1. If there are more than one page of conversations, scroll to the bottom of the list
2. Click "Load more conversations" → next page appends to the list
