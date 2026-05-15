import api from '@/lib/axios';

export const projectService = {
  getAll: (params?: Record<string, string | number>) => api.get('/projects', { params }),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: Record<string, unknown>) => api.post('/projects', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addMember: (id: string, userId: string) => api.post(`/projects/${id}/members`, { userId }),
  removeMember: (id: string, userId: string) => api.delete(`/projects/${id}/members/${userId}`),
};
