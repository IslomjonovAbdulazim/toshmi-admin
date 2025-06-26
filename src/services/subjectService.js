import api from './api';

export const subjectService = {
  getAll: async () => {
    return await api.get('/admin/subjects');
  },

  getById: async (id) => {
    return await api.get(`/admin/subjects/${id}`);
  },

  create: async (data) => {
    return await api.post('/admin/subjects', data);
  },

  update: async (id, data) => {
    return await api.put(`/admin/subjects/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/admin/subjects/${id}`);
  }
};