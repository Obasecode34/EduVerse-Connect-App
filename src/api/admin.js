import { api } from './client';

export const adminApi = {
  pendingEmployers: () => api.get('/users/employers/pending').then((r) => r.data),
  verifyEmployer: (id) => api.patch(`/users/employers/${id}/verify`).then((r) => r.data),
  rejectEmployer: (id) => api.delete(`/users/employers/${id}/reject`).then((r) => r.data),
};
