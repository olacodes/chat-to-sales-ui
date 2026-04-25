# Real-Time Updates (WebSocket)

## Overview
All live data in the app (new messages, conversation status changes, order updates) flows through a single persistent WebSocket connection. A connection status banner informs agents when the connection is degraded. A toast notification alerts agents when a message arrives in a conversation they're not currently viewing.

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/websocket/client.ts` | Singleton WebSocket client; manages connection, reconnection, event dispatch |
| `lib/hooks/useWebSocket.ts` | `useWsStatus()` — React hook exposing `ConnectionStatus` |
| `lib/hooks/useConversationsRealtime.ts` | Subscribes to WS events → updates Zustand store |
| `components/providers/WebSocketProvider.tsx` | Mounts the WS connection on app start |
| `components/conversations/ChatWindow.tsx` | Consumes `wsStatus` for the connection banner |
| `components/conversations/RealtimeToast.tsx` | Toast notification for messages in other conversations |
| `components/conversations/WsEventSimulator.tsx` | Dev-only tool to fire fake WS events |
| `store/useAppStore.ts` | `messages`, `conversations`, `orders`, `unreadCounts` updated by WS events |

---

## How It Works

### Connection lifecycle
1. `WebSocketProvider` mounts once at app level
2. Connects to the backend WS endpoint with the tenant's auth token
3. `ConnectionStatus` states: `connecting → connected | disconnected | error`
4. On disconnect: automatic exponential backoff reconnect
5. `useWsStatus()` returns the current status to any component that needs it

### Connection status banner
- Shown inside `ChatWindow` when `wsStatus !== 'connected'`
- **Connecting** → amber banner "Connecting to live updates…"
- **Disconnected** → red banner "Disconnected — reconnecting…"
- **Error** → red banner "Connection error — retrying…"
- Banner disappears automatically when connection is restored

### Incoming events → store updates
`useConversationsRealtime` handles these WS event types:

| Event | Action |
|-------|--------|
| `new_message` | Appends message to `messages[conversationId]`, increments `unreadCounts[conversationId]` if not the active conversation, updates `lastMessage` + `lastMessageAt` on the conversation |
| `conversation_status_changed` | Updates `conversations[id].status` |
| `order_state_changed` | Updates `orders[id].status` |
| `payment_confirmed` | Updates `orders[id]` payment state |
| `assignment_changed` | Updates `conversations[id].assignedTo` |

### RealtimeToast
- Fires when a `new_message` event arrives for a conversation that is NOT currently active
- Shows: customer name + message preview for 4 seconds
- Clicking the toast navigates to that conversation
- `lastActivity` / `clearActivity` state managed in `useConversationsRealtime`

### WsEventSimulator (dev only)
- Visible only in `NODE_ENV === 'development'`
- Floating panel in the bottom-right corner of the conversations layout
- Lets developers fire fake events (`new_message`, `order_state_changed`, etc.) against the active conversation without needing a real backend event
- Used for testing UI behaviour during development

---

## Connection Status Type

```ts
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
```

---

## How to Test

### Live message delivery
1. Open a conversation in the browser
2. Send a message from the customer side (WhatsApp or test tool)
3. Message should appear in the chat without page refresh

### Unread count via WS
1. Open conversations list (not inside a specific conversation)
2. Trigger a new message in any conversation (via WsEventSimulator in dev)
3. Unread badge count should increment on the conversation list item

### Connection banner
1. Stop the backend server while logged in
2. The chat header should show a red "Disconnected — reconnecting…" banner
3. Restart the backend → banner should disappear

### Toast notification
1. Open conversation A
2. Trigger a new message in conversation B (via WsEventSimulator → change active conversation ID, fire event)
3. A toast should appear with the customer name and message preview
4. Click toast → navigate to conversation B

### WsEventSimulator (dev)
1. Run `npm run dev`
2. Open `/conversations/[any-id]`
3. The floating simulator panel should be visible in the bottom-right
4. Fire a `new_message` event → message should appear in the thread
