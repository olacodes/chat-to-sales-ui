/**
 * ChatToSales — WebSocket client
 *
 * Connects to: ws://localhost:8000/ws/{tenant_id}
 * Configured via: NEXT_PUBLIC_WS_URL env var
 *
 * Features:
 *  - Typed message envelope
 *  - Multiple named message listeners
 *  - Exponential back-off reconnect (capped at 30 s)
 *  - Heartbeat ping to detect silent disconnects
 *  - SSR-safe (no-ops if window is undefined)
 */

// ─── Dev logger ──────────────────────────────────────────────────────────────

const isDev = process.env.NODE_ENV !== 'production';

function logWs(tag: string, ...args: unknown[]) {
  if (!isDev) return;
  console.debug(`[ws] ${tag}`, ...args);
}

// ─── Config ────────────────────────────────────────────────────────────────────

const WS_BASE = (process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000/ws').replace(/\/$/, '');

const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
const HEARTBEAT_INTERVAL_MS = 25_000;
const HEARTBEAT_TIMEOUT_MS = 5_000;

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/** All server-sent messages follow this envelope. */
export interface WsMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp?: string;
}

export type MessageListener<T = unknown> = (message: WsMessage<T>) => void;
export type StatusListener = (status: ConnectionStatus) => void;

// ─── Client class ──────────────────────────────────────────────────────────────

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private tenantId: string | null = null;

  private status: ConnectionStatus = 'disconnected';
  private shouldReconnect = false;

  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  // Listener registries
  private messageListeners = new Map<string, Set<MessageListener>>();
  private statusListeners = new Set<StatusListener>();

  // ─── Public API ──────────────────────────────────────────────────────────────

  /**
   * Connect (or reconnect) to the WebSocket for the given tenant.
   * Safe to call multiple times — existing connection is closed first.
   */
  connect(tenantId: string): void {
    if (typeof window === 'undefined') return;

    this.tenantId = tenantId;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;

    this.openSocket();
  }

  /** Permanently close the connection. Call before unmounting a provider. */
  disconnect(): void {
    this.shouldReconnect = false;
    this.clearTimers();
    this.ws?.close(1000, 'client disconnect');
    this.ws = null;
    this.setStatus('disconnected');
  }

  /**
   * Register a listener for a specific message type.
   * Use `'*'` to receive every message.
   *
   * @returns unsubscribe function
   */
  onMessage<T = unknown>(type: string, listener: MessageListener<T>): () => void {
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, new Set());
    }
    this.messageListeners.get(type)!.add(listener as MessageListener);

    return () => {
      this.messageListeners.get(type)?.delete(listener as MessageListener);
    };
  }

  /**
   * Register a listener for connection status changes.
   *
   * @returns unsubscribe function
   */
  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    // Immediately emit current status so late subscribers stay in sync
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  /** Send a typed message. Queues are not implemented — drops if not connected. */
  send<T = unknown>(type: string, payload: T): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    const envelope: WsMessage<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    this.ws.send(JSON.stringify(envelope));
  }

  get currentStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Dev/test only — inject a synthetic raw JSON message directly into the
   * dispatcher, bypassing the WebSocket connection entirely.
   *
   * @example
   * wsConnection.dispatchForTesting(JSON.stringify({
   *   type: 'MessageReceived',
   *   payload: { id: '1', conversationId: 'c1', role: 'customer', content: 'Hi', timestamp: '' },
   * }));
   */
  dispatchForTesting(raw: string): void {
    this.dispatchMessage(raw);
  }

  // ─── Internal ────────────────────────────────────────────────────────────────

  private openSocket(): void {
    if (!this.tenantId) return;

    this.setStatus('connecting');
    const url = `${WS_BASE}/${encodeURIComponent(this.tenantId)}`;

    try {
      this.ws = new WebSocket(url);
    } catch {
      // Invalid URL or browser security block
      this.setStatus('error');
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.setStatus('connected');
      this.startHeartbeat();
      logWs('connected', url);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      this.resetHeartbeatTimeout();
      this.dispatchMessage(event.data);
    };

    this.ws.onerror = () => {
      logWs('error', url);
      this.setStatus('error');
    };

    this.ws.onclose = (event: CloseEvent) => {
      logWs('closed', `code=${event.code}`, `reason=${event.reason || '—'}`);
      this.clearHeartbeat();
      // Code 1000 = normal closure triggered by us — don't reconnect
      if (event.code !== 1000) {
        this.setStatus('disconnected');
        if (this.shouldReconnect) this.scheduleReconnect();
      }
    };
  }

  private dispatchMessage(raw: string): void {
    let message: WsMessage;
    try {
      message = JSON.parse(raw) as WsMessage;
    } catch {
      // Non-JSON frames — treat as a plain text heartbeat pong
      return;
    }

    // Wildcard listeners
    this.messageListeners.get('*')?.forEach((l) => l(message));
    // Type-specific listeners
    if (message.type) {
      logWs('event', message.type, message.payload);
      this.messageListeners.get(message.type)?.forEach((l) => l(message));
    }
  }

  private setStatus(next: ConnectionStatus): void {
    if (this.status === next) return;
    logWs('status', `${this.status} → ${next}`);
    this.status = next;
    this.statusListeners.forEach((l) => l(next));
  }

  // ─── Reconnect with exponential back-off ─────────────────────────────────────

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) return;
    const delay = Math.min(RECONNECT_BASE_MS * 2 ** this.reconnectAttempts, RECONNECT_MAX_MS);
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      if (this.shouldReconnect) this.openSocket();
    }, delay);
  }

  // ─── Heartbeat (ping/pong) ────────────────────────────────────────────────────

  private startHeartbeat(): void {
    this.clearHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
        // Expect any frame back within timeout
        this.heartbeatTimeoutTimer = setTimeout(() => {
          // No pong received — force close and reconnect
          this.ws?.close();
        }, HEARTBEAT_TIMEOUT_MS);
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  private resetHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.resetHeartbeatTimeout();
  }

  private clearTimers(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.clearHeartbeat();
  }
}
