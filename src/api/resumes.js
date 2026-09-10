import { api } from './client';

export const resumesApi = {
  list: () => api.get('/resumes').then((r) => r.data),
  getById: (id) => api.get(`/resumes/${id}`).then((r) => r.data),
  create: (payload) => api.post('/resumes', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/resumes/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/resumes/${id}`).then((r) => r.data),
  // No axios-based download here on purpose: axios's arraybuffer/blob
  // handling is unreliable on React Native. Binary downloads go through
  // FileSystem.downloadAsync directly in ResumeBuilderScreen instead.
};
