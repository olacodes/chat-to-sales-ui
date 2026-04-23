import { apiClient } from '../client';
import type { StaffListResponse, StaffMemberOut } from '../types';
import type { StaffMember } from '@/store';

const BASE = '/api/v1';

function mapStaffMember(s: StaffMemberOut): StaffMember {
  return {
    id: s.id,
    displayName: s.display_name,
    email: s.email,
    role: s.role,
  };
}

export interface InviteOut {
  token: string;
  expires_at: string;
  role: string;
}

export interface InviteInfoOut {
  token: string;
  role: string;
  tenant_id: string;
}

export interface AcceptInvitePayload {
  name: string;
  email: string;
  password: string;
}

export interface AcceptInviteResponse {
  access_token: string;
  user_id: string;
  tenant_id: string;
  email: string;
}

export const staffApi = {
  /** GET /api/v1/staff — tenant_id injected automatically */
  list(signal?: AbortSignal): Promise<StaffMember[]> {
    return apiClient
      .get<StaffListResponse>(`${BASE}/staff`, undefined, signal)
      .then((res) => res.items.map(mapStaffMember));
  },

  /** POST /api/v1/staff/invite — generate an invite link */
  createInvite(role = 'member', signal?: AbortSignal): Promise<InviteOut> {
    return apiClient.post<InviteOut>(`${BASE}/staff/invite`, { role }, undefined, signal);
  },

  /** GET /api/v1/staff/invite/{token} — validate a token (no auth required) */
  getInvite(token: string, signal?: AbortSignal): Promise<InviteInfoOut> {
    return apiClient.get<InviteInfoOut>(`${BASE}/staff/invite/${encodeURIComponent(token)}`, undefined, signal);
  },

  /** POST /api/v1/staff/invite/{token}/accept — create account + join tenant */
  acceptInvite(token: string, payload: AcceptInvitePayload, signal?: AbortSignal): Promise<AcceptInviteResponse> {
    return apiClient.post<AcceptInviteResponse>(
      `${BASE}/staff/invite/${encodeURIComponent(token)}/accept`,
      payload,
      undefined,
      signal,
    );
  },

  /** DELETE /api/v1/staff/{user_id} — remove a member */
  removeMember(userId: string, signal?: AbortSignal): Promise<void> {
    return apiClient.delete<void>(`${BASE}/staff/${encodeURIComponent(userId)}`, undefined, signal);
  },
};
