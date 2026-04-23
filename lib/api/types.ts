/**
 * Raw API response and request types — mirrors the backend OpenAPI schema.
 *
 * All response fields use snake_case per Python/FastAPI convention.
 * Import these only inside lib/api/services.ts, never directly in UI code.
 */

// ─── Pagination ───────────────────────────────────────────────────────────────

/**
 * Paginated envelope returned by list endpoints.
 * The backend may return either T[] (flat) or PagedOut<T> (cursor-paged).
 * Use normalizePaged() in endpoint files to canonicalise both shapes.
 */
export interface PagedOut<T> {
  items: T[];
  next_cursor: string | null;
  /** Optional total count hint from the backend. */
  total?: number;
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export interface StaffMemberOut {
  id: string;
  display_name: string | null;
  email: string;
  role?: string;
}

export interface StaffListResponse {
  items: StaffMemberOut[];
}

// ─── Conversations ────────────────────────────────────────────────────────────

/** Shape returned by the list endpoint (lightweight, no messages). */
export interface ConversationListItem {
  id: string;
  tenant_id: string;
  customer_identifier: string;
  customer_name?: string;
  status: 'open' | 'closed' | 'pending';
  assigned_to?: StaffMemberOut | null;
  created_at: string;
  updated_at: string;
}

/** Shape returned by GET /conversations/{id} (includes messages). */
export interface ConversationOut {
  id: string;
  tenant_id: string;
  customer_identifier: string;
  customer_name?: string;
  status: 'open' | 'closed' | 'pending';
  assigned_to?: StaffMemberOut | null;
  created_at: string;
  updated_at: string;
  /** Included when fetching a specific conversation */
  messages?: MessageOut[];
  /** Included on list responses in place of the full messages array */
  last_message?: { content: string; timestamp: string } | null;
}

export type MessageSenderRole = 'user' | 'assistant' | 'system';

export interface ReactionOut {
  id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface AddReactionPayload {
  emoji: string;
  user_id: string;
}

export interface MessageOut {
  id: string;
  conversation_id: string;
  sender_role: MessageSenderRole;
  sender_identifier?: string | null;
  content: string;
  channel: string | null;
  created_at: string;
  reactions?: ReactionOut[];
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface OrderItemOut {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderOut {
  id: string;
  /** Backend uses "state" (not "status"). Values include inquiry, pending, confirmed, paid, completed, cancelled. */
  state: string;
  /** Total order amount. Null when the order has no items yet (e.g. inquiry state). */
  amount: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
  /** Count of line items. Present on list responses. */
  item_count: number;
  // ── Fields only present on single-resource GET ──────────────────────────────
  tenant_id?: string | null;
  conversation_id?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  /** Full item details — only on GET /orders/{id}. */
  items?: OrderItemOut[];
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export type ApiPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PaymentOut {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: ApiPaymentStatus;
  method: string | null;
  reference: string | null;
  /** Hosted payment URL for the customer to complete payment */
  payment_link: string | null;
  paid_at: string | null;
  created_at: string;
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface AssignConversationPayload {
  user_id: string | null;
  assigned_by_user_id?: string | null;
}

export interface AssignmentOut {
  conversation_id: string;
  assigned_to: StaffMemberOut | null;
}

export interface CreateConversationPayload {
  tenant_id: string;
  customer_identifier: string;
  customer_name?: string;
}

export interface AddMessagePayload {
  sender_role: MessageSenderRole;
  content: string;
  channel?: string;
}

export interface CreateOrderPayload {
  customer_id: string;
  customer_name: string;
  conversation_id?: string | null;
  items: Array<{
    product_id: string;
    name: string;
    quantity: number;
    unit_price: number;
  }>;
  currency?: string;
}

export interface InitiatePaymentPayload {
  order_id: string;
  amount: number;
  currency?: string;
  method?: string;
}

export interface InboundWebhookPayload {
  channel: string;
  /** The customer's identifier on the given channel (e.g. phone number, user id). */
  sender: string;
  message: string;
  tenant_id: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

/**
 * Response shape of GET /api/v1/dashboard (legacy) and
 * GET /api/v1/dashboard/overview (preferred).
 * All fields are optional — the two endpoints may differ in shape.
 */
export interface DashboardOverviewOut {
  // Conversation metrics
  total_conversations?: number;
  open_conversations?: number;
  active_conversations?: number;
  // Order metrics
  total_orders?: number;
  pending_orders?: number;
  completed_orders?: number;
  // Revenue (API may return as string e.g. "1000.00")
  total_revenue?: number | string;
  revenue?: number | string;
  currency?: string;
  // Conversion
  conversion_rate?: number;
  // Payments
  total_payments?: number;
  paid_payments?: number;
  // /overview endpoint wraps metrics under this key
  metrics?: DashboardOverviewOut;
}

/** Response shape of GET /api/v1/dashboard/metrics */
export interface DashboardMetricsOut extends DashboardOverviewOut {}

/** A single item in GET /api/v1/dashboard/recent-activity */
export interface RecentActivityItemOut {
  id?: string;
  /** Discriminator — values vary by backend (e.g. "order", "payment", "conversation", "message"). */
  type?: string;
  event_type?: string;
  kind?: string;
  // Timestamps
  created_at?: string;
  timestamp?: string;
  updated_at?: string;
  // Common payload fields (may be flat or under `data`)
  amount?: number | string;
  currency?: string;
  status?: string;
  state?: string;
  customer_name?: string;
  order_id?: string;
  reference?: string;
  description?: string;
  title?: string;
  /** /recent-activity uses this field for the human-readable description */
  content?: string;
  /** Nested payload — used when the backend wraps event data. */
  data?: Record<string, unknown>;
}

/** Envelope for GET /api/v1/dashboard/recent-activity */
export interface RecentActivityOut {
  items?: RecentActivityItemOut[];
  activities?: RecentActivityItemOut[];
  /** Some backends return a flat array directly. */
  [key: string]: unknown;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface ReportConfigOut {
  id: string;
  tenant_id: string;
  enabled: boolean;
  recipient_phone: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ReportConfigUpdate {
  enabled?: boolean;
  recipient_phone?: string | null;
  timezone?: string;
}

export interface SendPreviewResponse {
  message: string;
  preview_text: string;
}

export interface TriggerWeeklyResponse {
  message: string;
  week_start: string;
  status: string;
}

/** @deprecated Use DashboardOverviewOut */
export interface DashboardSummaryOut extends DashboardOverviewOut {
  total_conversations: number;
  open_conversations: number;
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  total_revenue: number;
  currency: string;
}
