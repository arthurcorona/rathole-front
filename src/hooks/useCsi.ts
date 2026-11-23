import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { csiApi } from '@/lib/api';
import type { CsiCaseStatus, CsiNoteInput, CsiTargetKind } from '@/types';

export const csiKeys = {
  all: ['csi'] as const,
  cases: ['csi', 'cases'] as const,
  case: (id: number) => ['csi', 'case', id] as const,
  target: (id: number) => ['csi', 'target', id] as const,
  timeline: (id: number) => ['csi', 'timeline', id] as const,
};

// ---- leitura (só depois que o ratosint respondeu: ele pode estar acordando) ----

export function useCsiCases(enabled: boolean) {
  return useQuery({ queryKey: csiKeys.cases, queryFn: csiApi.cases, enabled });
}

export function useCsiCase(id: number, enabled: boolean) {
  return useQuery({ queryKey: csiKeys.case(id), queryFn: () => csiApi.case(id), enabled: enabled && id > 0, retry: false });
}

export function useCsiTarget(id: number, enabled: boolean) {
  return useQuery({ queryKey: csiKeys.target(id), queryFn: () => csiApi.target(id), enabled: enabled && id > 0, retry: false });
}

export function useCsiTimeline(id: number, enabled: boolean) {
  return useQuery({ queryKey: csiKeys.timeline(id), queryFn: () => csiApi.timeline(id), enabled: enabled && id > 0 });
}

// ---- escrita: qualquer mudança no CSI invalida tudo do CSI (é pouco dado) ----

function useCsiMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: csiKeys.all }),
  });
}

export const useCreateCase = () =>
  useCsiMutation((body: { name: string; description?: string | null }) => csiApi.createCase(body));

export const useUpdateCase = () =>
  useCsiMutation(({ id, ...body }: { id: number; name: string; description: string | null; status?: CsiCaseStatus }) =>
    csiApi.updateCase(id, body),
  );

export const useDeleteCase = () => useCsiMutation((id: number) => csiApi.deleteCase(id));

export const useCreateTarget = () =>
  useCsiMutation(({ caseId, ...body }: { caseId: number; name: string; kind: CsiTargetKind; summary?: string | null }) =>
    csiApi.createTarget(caseId, body),
  );

export const useUpdateTarget = () =>
  useCsiMutation(({ id, ...body }: { id: number; name: string; kind: CsiTargetKind; summary: string | null }) =>
    csiApi.updateTarget(id, body),
  );

export const useDeleteTarget = () => useCsiMutation((id: number) => csiApi.deleteTarget(id));

export const useAddNote = () =>
  useCsiMutation(({ scope, id, note }: { scope: 'case' | 'target'; id: number; note: CsiNoteInput }) =>
    scope === 'case' ? csiApi.addCaseNote(id, note) : csiApi.addTargetNote(id, note),
  );

export const useDeleteNote = () => useCsiMutation((id: number) => csiApi.deleteNote(id));
