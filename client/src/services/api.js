import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accio_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem('accio_token');
      localStorage.removeItem('accio_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
