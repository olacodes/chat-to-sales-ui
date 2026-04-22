import { apiClient } from '../client';
import type {
  ReportConfigOut,
  ReportConfigUpdate,
  SendPreviewResponse,
} from '../types';

const BASE = '/api/v1/reports';

export const reportApi = {
  getConfig(signal?: AbortSignal): Promise<ReportConfigOut> {
    return apiClient.get<ReportConfigOut>(`${BASE}/config`, undefined, signal);
  },

  updateConfig(body: ReportConfigUpdate, signal?: AbortSignal): Promise<ReportConfigOut> {
    return apiClient.put<ReportConfigOut>(`${BASE}/config`, body, undefined, signal);
  },

  sendPreview(signal?: AbortSignal): Promise<SendPreviewResponse> {
    return apiClient.post<SendPreviewResponse>(`${BASE}/send-preview`, {}, undefined, signal);
  },
};
