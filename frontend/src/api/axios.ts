import axios from 'axios';

const api = axios.create({
  baseURL: 'https://geoapi.kstarstechnology.com/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gc_token');
      localStorage.removeItem('gc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default api;
