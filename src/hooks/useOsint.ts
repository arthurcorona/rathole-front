import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { osintApi } from '@/lib/api';
import type { OsintJobStatus } from '@/types';

export const osintKeys = {
  all: ['osint'] as const,
  status: ['osint', 'status'] as const,
  kinds: ['osint', 'kinds'] as const,
  jobs: ['osint', 'jobs'] as const,
  job: (id: string) => ['osint', 'job', id] as const,
};

export const isJobActive = (status?: OsintJobStatus) => status === 'pending' || status === 'running';

/** Saúde do ratosint. É a primeira chamada do painel e acorda o serviço se ele estiver dormindo. */
export function useOsintStatus() {
  return useQuery({
    queryKey: osintKeys.status,
    queryFn: osintApi.status,
    retry: 1,
    staleTime: 60 * 1000,
  });
}

export function useOsintKinds(enabled: boolean) {
  return useQuery({
    queryKey: osintKeys.kinds,
    queryFn: osintApi.kinds,
    enabled,
    staleTime: Infinity, // a lista de tipos só muda com deploy do ratosint
  });
}

/** Consultas recentes. Atualiza sozinha enquanto alguma estiver rodando. */
export function useOsintJobs(enabled: boolean) {
  return useQuery({
    queryKey: osintKeys.jobs,
    queryFn: () => osintApi.jobs(),
    enabled,
    refetchInterval: (query) => (query.state.data?.some((j) => isJobActive(j.status)) ? 3000 : false),
  });
}

/** Uma consulta com o resultado. Atualiza a cada 2 s até terminar. */
export function useOsintJob(id: string | null) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: osintKeys.job(id ?? ''),
    queryFn: () => osintApi.job(id as string),
    enabled: !!id,
    retry: false, // 404 = o ratosint reiniciou e perdeu a fila em memória
    refetchInterval: (q) => (isJobActive(q.state.data?.status) ? 2000 : false),
  });

  // quando a consulta aberta termina, a lista de recentes e o alvo do CSI (se houver)
  // atualizam na hora
  const status = query.data?.status;
  useEffect(() => {
    if (status === 'done' || status === 'error') {
      qc.invalidateQueries({ queryKey: osintKeys.jobs });
      qc.invalidateQueries({ queryKey: ['csi'] });
    }
  }, [status, qc]);

  return query;
}

export function useCreateOsintJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: osintApi.createJob,
    onSuccess: () => qc.invalidateQueries({ queryKey: osintKeys.jobs }),
  });
}
