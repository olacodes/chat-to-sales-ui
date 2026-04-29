'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { channelsApi } from '@/lib/api/endpoints/channels';
import { getTenantId } from '@/lib/auth/tokenStore';
import type { EmbeddedSignupSession } from '@/lib/hooks/useMetaEmbeddedSignup';

// ─── Query key factory ────────────────────────────────────────────────────────

export const channelKeys = {
  all: ['channels'] as const,
  list: () => [...channelKeys.all, 'list'] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Fetch all connected channels for the current tenant. */
export function useChannels() {
  return useQuery({
    queryKey: channelKeys.list(),
    queryFn: ({ signal }) => channelsApi.list(signal),
    staleTime: 30_000,
  });
}

/** Connect a WhatsApp Business account from the settings page via Embedded Signup. */
export function useConnectWhatsApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (session: EmbeddedSignupSession) =>
      channelsApi.connectFromEmbeddedSignup({
        tenant_id: getTenantId() ?? '',
        code: session.code,
        phone_number_id: session.phone_number_id,
        waba_id: session.waba_id,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: channelKeys.list() });
    },
  });
}
