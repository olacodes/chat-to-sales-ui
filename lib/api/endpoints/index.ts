/**
 * Barrel export for all typed API endpoint modules.
 *
 * Import directly from here for new code:
 *   import { conversationsApi, ordersApi, paymentsApi, dashboardApi } from '@/lib/api/endpoints';
 *
 * Existing code can continue importing from '@/lib/api/services' — the
 * backward-compatible aliases are maintained there.
 */

export * from './conversations';
export * from './orders';
export * from './payments';
export * from './dashboard';
