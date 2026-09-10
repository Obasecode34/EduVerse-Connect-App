import { api } from './client';

export const jobsApi = {
  list: (params) => api.get('/jobs', { params }).then((r) => r.data),
  getById: (id) => api.get(`/jobs/${id}`).then((r) => r.data),
  mine: () => api.get('/jobs/mine').then((r) => r.data),
  create: (payload) => api.post('/jobs', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/jobs/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/jobs/${id}`).then((r) => r.data),
  pending: () => api.get('/jobs/pending').then((r) => r.data),
  moderate: (id, payload) => api.patch(`/jobs/${id}/moderate`, payload).then((r) => r.data),
};
