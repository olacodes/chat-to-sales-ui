import { apiClient } from '../client';

const BASE = '/api/v1';

export interface ChannelOut {
  channel: string;
  phone_number_id: string;
  webhook_registered: boolean;
}

interface ChannelListResponse {
  items: ChannelOut[];
}

export const channelsApi = {
  /** GET /api/v1/channels — list connected channels for the current tenant (tenant_id auto-injected) */
  list(signal?: AbortSignal): Promise<ChannelOut[]> {
    return apiClient
      .get<ChannelListResponse>(`${BASE}/channels`, undefined, signal)
      .then((res) => res.items);
  },
};
