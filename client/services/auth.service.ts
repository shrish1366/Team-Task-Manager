import api from '@/lib/axios';

export const authService = {
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; avatar?: string }) => api.patch('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.patch('/auth/change-password', data),
};
