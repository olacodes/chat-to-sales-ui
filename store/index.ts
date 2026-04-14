/**
 * Store barrel — import everything from here.
 *   import { useAppStore, selectActiveConversation } from '@/store';
 */
export {
  useAppStore,
  selectActiveConversation,
  selectConversationMessages,
  selectOrderById,
  selectPaymentsByOrder,
  selectTotalUnread,
} from './useAppStore';

export type {
  Conversation,
  Message,
  Order,
  OrderItem,
  Payment,
  ConversationStatus,
  OrderStatus,
  PaymentStatus,
  MessageRole,
} from './useAppStore';
