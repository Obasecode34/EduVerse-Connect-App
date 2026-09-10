import { api } from './client';

export const applicationsApi = {
  apply: (jobId, payload) => api.post(`/applications/jobs/${jobId}/apply`, payload).then((r) => r.data),
  listMine: () => api.get('/applications/mine').then((r) => r.data),
  listForJob: (jobId) => api.get(`/applications/jobs/${jobId}`).then((r) => r.data),
  updateStatus: (id, payload) => api.patch(`/applications/${id}/status`, payload).then((r) => r.data),
};
