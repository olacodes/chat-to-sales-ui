# Offline Mode

## Overview
The app remains usable (read-only) when the network is unavailable by serving data from the React Query cache persisted to `localStorage`. A banner informs agents of their connectivity state. This is particularly important in Nigerian market conditions where mobile connections are unreliable.

---

## Key Files

| File | Purpose |
|------|---------|
| `components/providers/QueryProvider.tsx` | `PersistQueryClientProvider` with `localStorage` persister |
| `components/layout/OfflineBanner.tsx` | Banner tracking `navigator.onLine` + `useWsStatus()` |
| `components/layout/ShellClient.tsx` | Mounts `OfflineBanner` between Topbar and main content |
| `lib/hooks/useWebSocket.ts` | `useWsStatus()` — used by `OfflineBanner` to detect WS loss |

---

## How It Works

### Layer 1 — Cache persistence (React Query)
- `QueryProvider` wraps the app in `PersistQueryClientProvider` instead of plain `QueryClientProvider`
- Uses `createSyncStoragePersister` with `localStorage` as the backing store
- Cache buster key: `'v1'` — increment this to invalidate stale cached data after breaking schema changes
- `gcTime` (garbage-collect time): 24 hours — cached data survives that long without a network request
- On app load: if `localStorage` has a valid cached snapshot, React Query hydrates from it immediately — no loading spinner for returning users on slow connections

### Layer 2 — Offline banner
`OfflineBanner` listens to two independent signals:

| State | Trigger | Banner |
|-------|---------|--------|
| **Offline** | `navigator.onLine === false` | Amber — "You're offline. Showing cached data." |
| **Connection lost** | WS status = `disconnected` or `error` while online | Amber pulse — "Live updates paused. Reconnecting…" |
| **Connecting** | WS status = `connecting` | Subtle grey — "Connecting…" |
| **Back online** | `navigator.onLine` flips back to `true` | Green flash for 2.5 seconds — "Back online" |

- `navigator.onLine` changes are tracked via `window` event listeners (`online` / `offline`)
- Both signals are combined: either going offline OR losing the WS connection triggers a banner
- The green "Back online" flash auto-dismisses after 2.5 seconds

### What works offline
- **Reads**: All data that was fetched before going offline is still visible (conversations, messages, orders, payments, credit sales)
- **Writes fail gracefully**: Sending a message, assigning, marking resolved — these will fail with a network error. The app does not queue writes for later.

### What doesn't work offline
- New messages from customers (no WS)
- Any mutation (send, assign, settle, etc.)
- Fresh data fetches that aren't in cache

---

## Configuration

```ts
// components/providers/QueryProvider.tsx
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in ms

PersistQueryClientProvider({
  persistOptions: {
    persister: createSyncStoragePersister({ storage: localStorage }),
    maxAge: CACHE_MAX_AGE,
    buster: 'v1', // bump this to clear all client caches after breaking changes
  }
})
```

---

## How to Test

### Cache persistence
1. Load the app fully (conversations, orders, payments all visible)
2. Close the browser tab completely
3. Disable network (DevTools → Network → Offline)
4. Reopen the app — data should appear immediately from cache without any loading spinners

### Offline banner
1. Load the app with network connected
2. In DevTools → Network → set to Offline
3. Amber banner should appear: "You're offline. Showing cached data."
4. Re-enable network → green "Back online" flash for ~2.5 seconds, then banner disappears

### WS disconnection banner (independent of network)
1. Keep the network connected but stop the backend server
2. After a few seconds, the amber pulsing "Live updates paused" banner should appear in the conversations header
3. Restart the backend → banner disappears

### Cache busting
1. Change `buster: 'v1'` to `buster: 'v2'` in `QueryProvider.tsx`
2. Reload the app — all cached data should be cleared and fresh fetches start (loading states visible)
