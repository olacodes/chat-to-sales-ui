/**
 * WebSocket manager for real-time updates.
 * Connects to the ChatToSales backend WS server.
 */

type MessageHandler = (event: MessageEvent) => void;
type StatusHandler = () => void;

interface WebSocketManagerOptions {
  url: string;
  onMessage?: MessageHandler;
  onOpen?: StatusHandler;
  onClose?: StatusHandler;
  onError?: (event: Event) => void;
  /** Auto-reconnect delay in ms (default: 3000). Set to 0 to disable. */
  reconnectDelay?: number;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private options: WebSocketManagerOptions;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;

  constructor(options: WebSocketManagerOptions) {
    this.options = options;
  }

  connect() {
    if (typeof window === 'undefined') return; // no-op in SSR
    this.shouldReconnect = true;
    this.open();
  }

  private open() {
    this.ws = new WebSocket(this.options.url);

    this.ws.onopen = () => {
      this.options.onOpen?.();
    };

    this.ws.onmessage = (event) => {
      this.options.onMessage?.(event);
    };

    this.ws.onerror = (event) => {
      this.options.onError?.(event);
    };

    this.ws.onclose = () => {
      this.options.onClose?.();
      if (this.shouldReconnect && (this.options.reconnectDelay ?? 3000) > 0) {
        this.reconnectTimer = setTimeout(() => {
          this.open();
        }, this.options.reconnectDelay ?? 3000);
      }
    };
  }

  send(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}
