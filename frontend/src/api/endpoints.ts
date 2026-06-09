import api from './axios';

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
};

export const ordersApi = {
  getAll: (params?: { status?: string; page?: number }) =>
    api.get('/orders', { params }),
  getById: (orderId: string) => api.get(`/orders/${orderId}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (orderId: string, data: { status: string; note?: string }) =>
    api.patch(`/orders/${orderId}/status`, data),
};

export const trackingApi = {
  getStatus: (orderId: string) => api.get(`/tracking/${orderId}`),
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
};

export const complaintsApi = {
  getByOrder: (orderId: string) => api.get(`/complaints/order/${orderId}`),
  updateStatus: (ticketId: string, data: any) =>
    api.patch(`/complaints/${ticketId}/status`, data),
};
