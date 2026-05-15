import api from '@/lib/axios';

export const userService = {
  getAll: (params?: Record<string, string | number>) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  updateRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }),
  delete: (id: string) => api.delete(`/users/${id}`),
};
