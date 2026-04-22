'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '@/lib/api/endpoints/reports';
import type { ReportConfigOut, ReportConfigUpdate, SendPreviewResponse } from '@/lib/api/types';

// ─── Query key factory ────────────────────────────────────────────────────────

export const reportKeys = {
  all: ['reports'] as const,
  config: () => [...reportKeys.all, 'config'] as const,
} as const;

// ─── useReportConfig ──────────────────────────────────────────────────────────

export function useReportConfig() {
  return useQuery<ReportConfigOut, Error>({
    queryKey: reportKeys.config(),
    queryFn: ({ signal }) => reportApi.getConfig(signal),
    staleTime: 60_000,
  });
}

// ─── useUpdateReportConfig ────────────────────────────────────────────────────

export function useUpdateReportConfig() {
  const qc = useQueryClient();
  return useMutation<ReportConfigOut, Error, ReportConfigUpdate>({
    mutationFn: (body) => reportApi.updateConfig(body),
    onSuccess: (updated) => {
      qc.setQueryData<ReportConfigOut>(reportKeys.config(), updated);
    },
  });
}

// ─── useSendPreview ───────────────────────────────────────────────────────────

export function useSendPreview() {
  return useMutation<SendPreviewResponse, Error, void>({
    mutationFn: () => reportApi.sendPreview(),
  });
}
