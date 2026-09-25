import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { radarApi } from '@/lib/api';
import type { RadarPatch, RadarStatus } from '@/types';

export const radarKeys = {
  all: ['radar'] as const,
  admin: (status: RadarStatus) => ['radar', 'admin', status] as const,
  daily: (params: { date?: string; days?: number }) => ['radar', 'daily', params] as const,
  weekly: ['radar', 'weekly'] as const,
};

export function useRadarAdmin(status: RadarStatus) {
  return useQuery({
    queryKey: radarKeys.admin(status),
    queryFn: () => radarApi.adminList(status),
  });
}

export function useRadarPatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: RadarPatch & { id: string }) => radarApi.adminPatch(id, body),
    // qualquer mudança de curadoria afeta fila, edição diária e dossiê
    onSuccess: () => qc.invalidateQueries({ queryKey: radarKeys.all }),
  });
}

export function useRadarDaily(params: { date?: string; days?: number } = {}, enabled = true) {
  return useQuery({
    queryKey: radarKeys.daily(params),
    queryFn: () => radarApi.daily(params),
    enabled,
  });
}

export function useRadarWeekly() {
  return useQuery({
    queryKey: radarKeys.weekly,
    queryFn: radarApi.weekly,
    staleTime: 5 * 60 * 1000, // o dossiê muda pouco
  });
}
