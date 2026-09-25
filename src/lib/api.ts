import axios from 'axios';
import type {
  RadarItem,
  RadarPatch,
  RadarStatus,
  RadarDailyResponse,
  RadarWeeklyResponse,
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
  /** admin: fila de curadoria por status */
  adminList: (status: RadarStatus) =>
    api.get<RadarItem[]>('/radar/admin', { params: { status } }).then((r) => r.data),

  /** admin: aprovar / descartar / trocar tier / posição no dossiê */
  adminPatch: (id: string, body: RadarPatch) =>
    api.patch<RadarItem>(`/radar/admin/${id}`, body).then((r) => r.data),

  /** membros: edição do dia (ou últimos N dias) */
  daily: (params: { date?: string; days?: number } = {}) =>
    api.get<RadarDailyResponse>('/radar/daily', { params }).then((r) => r.data),

  /** público: dossiê semanal */
  weekly: () => api.get<RadarWeeklyResponse>('/radar/weekly').then((r) => r.data),
};
