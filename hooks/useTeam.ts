'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '@/lib/api/endpoints/staff';
import type { StaffMember } from '@/store';

// ─── Query key factory ────────────────────────────────────────────────────────

export const staffKeys = {
  all: ['staff'] as const,
  list: () => [...staffKeys.all, 'list'] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Fetch the current team members list. */
export function useTeamMembers() {
  return useQuery({
    queryKey: staffKeys.list(),
    queryFn: ({ signal }) => staffApi.list(signal),
    staleTime: 60_000,
  });
}

/** Generate a single-use invite link.  Returns the raw token. */
export function useCreateInvite() {
  return useMutation({
    mutationFn: () => staffApi.createInvite('member'),
  });
}

/** Remove a staff member from the tenant. */
export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => staffApi.removeMember(userId),
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: staffKeys.list() });
      const prev = qc.getQueryData<StaffMember[]>(staffKeys.list());
      qc.setQueryData<StaffMember[]>(staffKeys.list(), (old) =>
        old?.filter((m) => m.id !== userId) ?? [],
      );
      return { prev };
    },
    onError: (_err, _userId, ctx) => {
      if (ctx?.prev) qc.setQueryData(staffKeys.list(), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: staffKeys.list() });
    },
  });
}
