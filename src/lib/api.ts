import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // envia o cookie HttpOnly automaticamente
});

// 401 → token expirado ou inválido: faz logout e redireciona
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isLogoutCall = error.config?.url?.includes('/auth/logout');

    if (error.response?.status === 401 && !isLogoutCall) {
      try {
        await api.post('/auth/logout');
      } catch {
        // ignora erro no logout — o importante é limpar o estado local
      }
      localStorage.removeItem('rathole_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
