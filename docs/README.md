# ChatToSales — Feature Documentation

One file per functional flow. Each doc covers: what the feature does, which files implement it, how the data flows, and how to test it end-to-end.

| # | Doc | Flow |
|---|-----|------|
| 1 | [Authentication](./01-authentication.md) | Signup, Login, Google OAuth, Team invite, WhatsApp onboarding |
| 2 | [Conversations](./02-conversations.md) | List, tabs, search, unread counts, debt badge, assignee display |
| 3 | [Messaging](./03-messaging.md) | Send, reply-to, emoji reactions, scheduled messages, auto-assign |
| 4 | [Orders](./04-orders.md) | Order list, filters, lifecycle actions, inline order card |
| 5 | [Payments](./05-payments.md) | Payment list, summary metrics, filter and search |
| 6 | [Credit Sales](./06-credit-sales.md) | Mark as credit, send reminder, settle/dispute, credit dashboard |
| 7 | [Dashboard](./07-dashboard.md) | Metrics overview, orders by status, Today's Focus |
| 8 | [Settings](./08-settings.md) | Channels, team management, weekly report notifications |
| 9 | [Real-Time / WebSocket](./09-realtime.md) | WS connection, status banner, RealtimeToast, WsEventSimulator |
| 10 | [Offline Mode](./10-offline-mode.md) | Cache persistence (React Query), OfflineBanner |
