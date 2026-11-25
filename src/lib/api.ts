import axios from 'axios';
import type {
  RadarItem,
  RadarPatch,
  RadarAdminView,
  RadarAdminPage,
  RadarDailyResponse,
  RadarWeeklyResponse,
  OsintJob,
  OsintKind,
  OsintStatus,
  CsiCaseDetail,
  CsiCaseStatus,
  CsiCaseSummary,
  CsiNote,
  CsiNoteInput,
  CsiTarget,
  CsiTargetDetail,
  CsiTargetKind,
  CsiTimelineEvent,
} from '@/types';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rathole_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/signup');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('rathole_token');
      localStorage.removeItem('rathole_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---- Radar ----
export const radarApi = {
  /** admin: painel de curadoria, paginado por aba */
  adminList: (view: RadarAdminView, page: number, limit: number) =>
    api.get<RadarAdminPage>('/radar/admin', { params: { view, page, limit } }).then((r) => r.data),

  /** admin: aprovar / descartar / trocar tier / posição no dossiê */
  adminPatch: (id: string, body: RadarPatch) =>
    api.patch<RadarItem>(`/radar/admin/${id}`, body).then((r) => r.data),

  /** membros: edição do dia (ou últimos N dias) */
  daily: (params: { date?: string; days?: number } = {}) =>
    api.get<RadarDailyResponse>('/radar/daily', { params }).then((r) => r.data),

  /** público: dossiê semanal */
  weekly: () => api.get<RadarWeeklyResponse>('/radar/weekly').then((r) => r.data),
};

// ---- OSINT (admin; o back repassa para o ratosint) ----
// O ratosint dorme no plano free do Render: a primeira chamada pode levar ~1 min.
export const osintApi = {
  status: () => api.get<OsintStatus>('/osint/status').then((r) => r.data),

  kinds: () => api.get<OsintKind[]>('/osint/kinds').then((r) => r.data),

  jobs: (limit = 30) => api.get<OsintJob[]>('/osint/jobs', { params: { limit } }).then((r) => r.data),

  job: (id: string) => api.get<OsintJob>(`/osint/jobs/${id}`).then((r) => r.data),

  /** target_id liga a consulta a um alvo do CSI */
  createJob: (body: { kind: string; value: string; target_id?: number }) =>
    api.post<OsintJob>('/osint/jobs', body).then((r) => r.data),

  /** arquivo gerado por uma consulta (JSON, CSV, imagem), como Blob para download */
  file: (jobId: string, path: string) =>
    api
      .get<Blob>(`/osint/jobs/${jobId}/files/${path.split('/').map(encodeURIComponent).join('/')}`, {
        responseType: 'blob',
      })
      .then((r) => r.data),
};

// ---- CSI: investigações do usuário (o back repassa para o ratosint) ----
export const csiApi = {
  cases: () => api.get<CsiCaseSummary[]>('/osint/csi/cases').then((r) => r.data),

  createCase: (body: { name: string; description?: string | null }) =>
    api.post<{ id: number; name: string }>('/osint/csi/cases', body).then((r) => r.data),

  case: (id: number) => api.get<CsiCaseDetail>(`/osint/csi/cases/${id}`).then((r) => r.data),

  /** o ratosint grava nome e descrição juntos: mande sempre os dois */
  updateCase: (id: number, body: { name: string; description: string | null; status?: CsiCaseStatus }) =>
    api.patch(`/osint/csi/cases/${id}`, body).then((r) => r.data),

  deleteCase: (id: number) => api.delete(`/osint/csi/cases/${id}`).then((r) => r.data),

  createTarget: (caseId: number, body: { name: string; kind: CsiTargetKind; summary?: string | null }) =>
    api.post<CsiTarget>(`/osint/csi/cases/${caseId}/targets`, body).then((r) => r.data),

  target: (id: number) => api.get<CsiTargetDetail>(`/osint/csi/targets/${id}`).then((r) => r.data),

  /** o ratosint grava nome, tipo e resumo juntos: mande sempre os três */
  updateTarget: (id: number, body: { name: string; kind: CsiTargetKind; summary: string | null }) =>
    api.patch<CsiTarget>(`/osint/csi/targets/${id}`, body).then((r) => r.data),

  deleteTarget: (id: number) => api.delete(`/osint/csi/targets/${id}`).then((r) => r.data),

  addCaseNote: (caseId: number, body: CsiNoteInput) =>
    api.post<CsiNote>(`/osint/csi/cases/${caseId}/notes`, body).then((r) => r.data),

  addTargetNote: (targetId: number, body: CsiNoteInput) =>
    api.post<CsiNote>(`/osint/csi/targets/${targetId}/notes`, body).then((r) => r.data),

  deleteNote: (id: number) => api.delete(`/osint/csi/notes/${id}`).then((r) => r.data),

  timeline: (targetId: number) =>
    api.get<CsiTimelineEvent[]>(`/osint/csi/targets/${targetId}/timeline`).then((r) => r.data),
};
