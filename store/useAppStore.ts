import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ─── Domain types ──────────────────────────────────────────────────────────────

export type ConversationStatus = 'open' | 'resolved' | 'pending';
export type OrderStatus = 'inquiry' | 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  senderIdentifier: string | null;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  customerName: string;
  /** The channel-specific identifier (e.g. phone number, user id) */
  customerIdentifier: string;
  status: ConversationStatus;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  messages: Message[];
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  conversationId: string | null;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  reference: string | null;
  /** Hosted payment URL returned by the payment gateway. */
  paymentLink: string | null;
  paidAt: string | null;
  createdAt: string;
}

// ─── Store shape ───────────────────────────────────────────────────────────────

interface AppState {
  // ── Data ──
  conversations: Conversation[];
  orders: Order[];
  payments: Payment[];

  /** The conversation currently open in the chat panel */
  activeConversationId: string | null;

  // ── Conversation actions ──
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, patch: Partial<Omit<Conversation, 'id' | 'messages'>>) => void;
  setActiveConversation: (id: string | null) => void;

  // ── Message actions ──
  addMessage: (message: Message) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;

  // ── Order actions ──
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, patch: Partial<Omit<Order, 'id'>>) => void;

  // ── Payment actions ──
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, patch: Partial<Omit<Payment, 'id'>>) => void;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // ── Initial state ──
      conversations: [],
      orders: [],
      payments: [],
      activeConversationId: null,

      // ── Conversation actions ──────────────────────────────────────────────────

      setConversations: (conversations) =>
        set({ conversations }, false, 'conversations/set'),

      addConversation: (conversation) =>
        set(
          (state) => ({
            conversations: [conversation, ...state.conversations],
          }),
          false,
          'conversations/add',
        ),

      updateConversation: (id, patch) =>
        set(
          (state) => ({
            conversations: state.conversations.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          }),
          false,
          'conversations/update',
        ),

      setActiveConversation: (id) =>
        set({ activeConversationId: id }, false, 'conversations/setActive'),

      // ── Message actions ───────────────────────────────────────────────────────

      addMessage: (message) =>
        set(
          (state) => ({
            conversations: state.conversations.map((c) => {
              if (c.id !== message.conversationId) return c;
              return {
                ...c,
                messages: [...c.messages, message],
                lastMessage: message.content,
                lastMessageAt: message.timestamp,
                unreadCount:
                  state.activeConversationId === c.id ? 0 : c.unreadCount + 1,
              };
            }),
          }),
          false,
          'messages/add',
        ),

      setMessages: (conversationId, messages) =>
        set(
          (state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? { ...c, messages, unreadCount: 0 }
                : c,
            ),
          }),
          false,
          'messages/set',
        ),

      // ── Order actions ─────────────────────────────────────────────────────────

      setOrders: (orders) =>
        set({ orders }, false, 'orders/set'),

      addOrder: (order) =>
        set(
          (state) => ({ orders: [order, ...state.orders] }),
          false,
          'orders/add',
        ),

      updateOrder: (id, patch) =>
        set(
          (state) => ({
            orders: state.orders.map((o) =>
              o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o,
            ),
          }),
          false,
          'orders/update',
        ),

      // ── Payment actions ───────────────────────────────────────────────────────

      setPayments: (payments) =>
        set({ payments }, false, 'payments/set'),

      addPayment: (payment) =>
        set(
          (state) => ({ payments: [payment, ...state.payments] }),
          false,
          'payments/add',
        ),

      updatePayment: (id, patch) =>
        set(
          (state) => ({
            payments: state.payments.map((p) =>
              p.id === id ? { ...p, ...patch } : p,
            ),
          }),
          false,
          'payments/update',
        ),
    }),
    { name: 'ChatToSales' },
  ),
);

// ─── Selectors ─────────────────────────────────────────────────────────────────
// Use these in components to avoid re-renders from unrelated state changes.

export const selectActiveConversation = (state: AppState) =>
  state.conversations.find((c) => c.id === state.activeConversationId) ?? null;

export const selectConversationMessages =
  (conversationId: string) => (state: AppState) =>
    state.conversations.find((c) => c.id === conversationId)?.messages ?? [];

export const selectOrderById =
  (orderId: string) => (state: AppState) =>
    state.orders.find((o) => o.id === orderId) ?? null;

export const selectPaymentsByOrder =
  (orderId: string) => (state: AppState) =>
    state.payments.filter((p) => p.orderId === orderId);

export const selectTotalUnread = (state: AppState) =>
  state.conversations.reduce((sum, c) => sum + c.unreadCount, 0);
