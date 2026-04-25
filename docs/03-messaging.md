# Messaging

## Overview
The core chat interaction. Agents can read customer messages, reply, react with emojis, quote/reply to a specific message, and schedule messages for later delivery. Replying to an unassigned conversation automatically assigns it to the responding agent.

---

## Key Files

| File | Purpose |
|------|---------|
| `components/conversations/ChatWindow.tsx` | Main chat container: header, message list, input, order card |
| `components/conversations/ChatInput.tsx` | Text input, send button, reply-to strip, snooze/schedule popover |
| `components/conversations/MessageBubble.tsx` | Individual message: bubble, avatar/initials, sender label, emoji reactions, reply button |
| `components/conversations/SnoozePopover.tsx` | Date/time picker for scheduling messages |
| `app/(app)/conversations/[id]/page.tsx` | Wires hooks → ChatWindow props |
| `hooks/useConversations.ts` | `useSendMessage`, `useMessages`, `useReactToMessage`, `useScheduledMessages`, `useCreateScheduledMessage`, `useCancelScheduledMessage` |

---

## How It Works

### Sending a message
1. Agent types in `ChatInput` and presses Enter or the send button
2. `onSend(content)` calls `onSendMessage(conversationId, content)` in the page
3. `useSendMessage().mutate({ conversationId, payload, recipient })` → `POST /api/v1/conversations/{id}/messages`
4. New message arrives via WebSocket (`new_message` event) and updates the message list

### Auto-assign on reply
- Triggered inside `handleSendMessage` in `[id]/page.tsx`
- If `conversation.assignedTo === null` AND `currentUserId` is set:
  - Calls `assignConversation({ conversationId, userId: currentUserId, ... })` in the same handler
  - The conversation becomes assigned to the replying agent immediately

### Message grouping
- Consecutive messages from the same role (`customer` / `assistant`) are grouped
- `isGrouped = true` suppresses the avatar on subsequent bubbles in the same group

### Agent name display
- Agent name is derived: `conversation.assignedTo ?? staff.find(s => s.id === currentUserId)`
- Displayed as a sender label below outgoing bubbles
- Avatar initials: first 2 chars of single-word name; first char of each word for multi-word names
- Falls back to "AI Assistant" label if no agent is identified

### Reply-to (quote)
1. Hover a message bubble → reply icon appears
2. Click → `setReplyTo(message)` stores the quoted message in state
3. `ChatInput` shows a strip with the quoted message preview
4. Press X / "Cancel reply" → clears `replyTo`
5. Quoted message reference is sent with the new message payload

### Emoji reactions
1. Hover a message → emoji picker icon appears
2. Select an emoji → `onReact(conversationId, messageId, emoji)` called
3. `useReactToMessage().mutate(...)` → `POST /api/v1/conversations/{id}/messages/{msgId}/reactions`
4. Reaction renders below the bubble

### Scheduled messages
1. In `ChatInput`, open the clock/snooze icon → `SnoozePopover`
2. Pick a date/time → `onSchedule(content, scheduledFor)` called
3. `useCreateScheduledMessage()` → `POST /api/v1/conversations/{id}/scheduled-messages`
4. Scheduled message appears as a dashed bubble in the message area with "Sends [time]" label
5. Cancel button calls `onCancelScheduledMessage(conversationId, scheduledMessageId)`

### Loading and pagination
- `useMessages(id)` fetches paginated messages (newest-last order)
- "Load earlier messages" button at the top calls `fetchNextPage()`
- Skeleton shown while first page loads
- Auto-scroll to bottom on every new message via `messagesEndRef`

---

## Data Model

```ts
interface Message {
  id: string;
  conversationId: string;
  role: 'customer' | 'assistant';
  content: string;
  senderIdentifier: string | null; // set for customer messages only
  reactions: Reaction[];
  replyTo: Message | null;
  createdAt: string;
}

interface ScheduledMessage {
  id: string;
  conversationId: string;
  content: string;
  scheduledFor: string; // ISO datetime
}
```

---

## How to Test

### Send a message
1. Open a conversation, type a message, press Enter
2. Message should appear immediately in the thread

### Auto-assign
1. Open an **Unassigned** conversation
2. Send any message
3. Conversation should now show the agent's name in the assignee field

### Reply-to (quote)
1. Hover over any message → click the reply icon
2. Input should show the quoted message strip
3. Send a reply → new bubble should reference the quoted message

### Emoji reaction
1. Hover a message → click the emoji icon
2. Select any emoji → it should appear below that message bubble

### Schedule a message
1. Type a message, click the clock icon
2. Pick a future date/time → confirm
3. Dashed scheduled bubble should appear in the chat
4. Click "Cancel" on the bubble → it should disappear

### Load earlier messages
1. Open a conversation with many messages
2. Scroll to the top → click "Load earlier messages"
3. Older messages should prepend to the list
