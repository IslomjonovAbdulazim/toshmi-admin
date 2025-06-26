import api from './api';

export const teacherService = {
  getAll: async () => {
    return await api.get('/admin/teachers');
  },

  getById: async (id) => {
    return await api.get(`/admin/teachers/${id}`);
  },

  create: async (data) => {
    return await api.post('/admin/teachers', data);
  },

  update: async (id, data) => {
    return await api.put(`/admin/teachers/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/admin/teachers/${id}`);
  }
};