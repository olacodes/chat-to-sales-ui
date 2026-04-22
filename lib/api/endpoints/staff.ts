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

export const staffApi = {
  /** GET /api/v1/staff — tenant_id injected automatically */
  list(signal?: AbortSignal): Promise<StaffMember[]> {
    return apiClient
      .get<StaffListResponse>(`${BASE}/staff`, undefined, signal)
      .then((res) => res.items.map(mapStaffMember));
  },
};
