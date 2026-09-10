import { api } from './client';

export const notificationsApi = {
  list: () => api.get('/notifications').then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  registerPushToken: (token) => api.post('/notifications/push-token', { token }).then((r) => r.data),
};
