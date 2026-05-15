import api from '@/lib/axios';

export const dashboardService = {
  getAdmin: () => api.get('/dashboard/admin'),
  getMember: () => api.get('/dashboard/member'),
};
