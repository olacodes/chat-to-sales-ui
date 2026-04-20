/**
 * Notifications endpoint
 *
 * Used to forward outbound messages to the customer's channel (WhatsApp, SMS, email).
 * tenant_id is injected automatically by the base client as a query param.
 */

import { apiClient } from '../client';

export type NotificationChannel = 'whatsapp' | 'sms' | 'email';

export interface SendNotificationPayload {
  tenant_id: string;
  recipient: string;
  channel: NotificationChannel;
  template_name: string;
  variables?: Record<string, string>;
}

const BASE = '/api/v1';

export const notificationsApi = {
  /**
   * POST /api/v1/notifications/send
   * Forwards a message to the customer via their channel (e.g. WhatsApp).
   */
  send(payload: SendNotificationPayload, signal?: AbortSignal): Promise<Record<string, string>> {
    return apiClient.post<Record<string, string>>(
      `${BASE}/notifications/send`,
      payload,
      undefined,
      signal,
    );
  },
};
