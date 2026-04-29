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

interface WhatsAppConnectResponse {
  status: string;
  channel: string;
  phone_number_id: string;
  webhook_registered: boolean;
}

export const channelsApi = {
  /** GET /api/v1/channels — list connected channels for the current tenant (tenant_id auto-injected) */
  list(signal?: AbortSignal): Promise<ChannelOut[]> {
    return apiClient
      .get<ChannelListResponse>(`${BASE}/channels`, undefined, signal)
      .then((res) => res.items);
  },

  /**
   * POST /api/v1/channels/whatsapp/embedded-signup
   *
   * Exchanges the short-lived code from the Meta Embedded Signup popup for an
   * access token and stores the channel credentials on the backend.
   * Must be called immediately after the popup completes — the code has a 30s TTL.
   */
  connectFromEmbeddedSignup(
    payload: {
      tenant_id: string;
      code: string;
      phone_number_id: string;
      waba_id: string;
    },
    signal?: AbortSignal,
  ): Promise<WhatsAppConnectResponse> {
    return apiClient.post<WhatsAppConnectResponse>(
      `${BASE}/channels/whatsapp/embedded-signup`,
      payload,
      signal,
    );
  },
};
