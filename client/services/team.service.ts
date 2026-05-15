import api from '@/lib/axios';

export const teamService = {
  getAll: (params?: Record<string, string | number>) => api.get('/teams', { params }),
  getById: (id: string) => api.get(`/teams/${id}`),
  create: (data: Record<string, unknown>) => api.post('/teams', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/teams/${id}`, data),
  delete: (id: string) => api.delete(`/teams/${id}`),
  addMember: (id: string, userId: string) => api.post(`/teams/${id}/members`, { userId }),
  removeMember: (id: string, userId: string) => api.delete(`/teams/${id}/members/${userId}`),
};
