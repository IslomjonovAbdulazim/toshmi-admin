import api from './api';

export const parentService = {
  getAll: async () => {
    return await api.get('/admin/parents');
  },

  getById: async (id) => {
    return await api.get(`/admin/parents/${id}`);
  },

  create: async (data) => {
    return await api.post('/admin/parents', data);
  },

  update: async (id, data) => {
    return await api.put(`/admin/parents/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/admin/parents/${id}`);
  }
};