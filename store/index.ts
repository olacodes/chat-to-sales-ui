/**
 * Store barrel — import everything from here.
 *   import { useAppStore, selectActiveConversation } from '@/store';
 *   import { useAuthStore } from '@/store';
 */
export {
  useAppStore,
  selectActiveConversation,
  selectConversationMessages,
  selectOrderById,
  selectPaymentsByOrder,
  selectTotalUnread,
} from './useAppStore';

export { useAuthStore } from './useAuthStore';

export type {
  Conversation,
  Message,
  Order,
  OrderItem,
  Payment,
  StaffMember,
  ConversationStatus,
  OrderStatus,
  PaymentStatus,
  MessageRole,
} from './useAppStore';
