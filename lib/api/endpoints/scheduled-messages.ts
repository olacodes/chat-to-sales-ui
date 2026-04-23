import { apiClient } from '../client';
import type { ScheduledMessageOut, ScheduledMessageListOut, ScheduleMessagePayload } from '../types';
import type { ScheduledMessage } from '@/store';

const BASE = '/api/v1';

function mapScheduledMessage(m: ScheduledMessageOut): ScheduledMessage {
  return {
    id: m.id,
    conversationId: m.conversation_id,
    content: m.content,
    scheduledFor: m.scheduled_for,
    status: m.status,
    createdAt: m.created_at,
  };
}

export const scheduledMessagesApi = {
  /** GET /api/v1/conversations/{id}/scheduled-messages */
  list(conversationId: string, signal?: AbortSignal): Promise<ScheduledMessage[]> {
    return apiClient
      .get<ScheduledMessageListOut>(
        `${BASE}/conversations/${encodeURIComponent(conversationId)}/scheduled-messages`,
        undefined,
        signal,
      )
      .then((res) => res.items.map(mapScheduledMessage));
  },

  /** POST /api/v1/conversations/{id}/scheduled-messages */
  create(
    conversationId: string,
    payload: ScheduleMessagePayload,
    signal?: AbortSignal,
  ): Promise<ScheduledMessage> {
    return apiClient
      .post<ScheduledMessageOut>(
        `${BASE}/conversations/${encodeURIComponent(conversationId)}/scheduled-messages`,
        payload,
        undefined,
        signal,
      )
      .then(mapScheduledMessage);
  },

  /** DELETE /api/v1/conversations/{id}/scheduled-messages/{smId} */
  cancel(conversationId: string, scheduledMessageId: string, signal?: AbortSignal): Promise<void> {
    return apiClient.delete<void>(
      `${BASE}/conversations/${encodeURIComponent(conversationId)}/scheduled-messages/${encodeURIComponent(scheduledMessageId)}`,
      undefined,
      signal,
    );
  },
};
