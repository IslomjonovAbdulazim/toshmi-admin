import api from './api';

export const studentService = {
  getAll: async () => {
    return await api.get('/admin/students');
  },

  getById: async (id) => {
    return await api.get(`/admin/students/${id}`);
  },

  create: async (data) => {
    return await api.post('/admin/students', data);
  },

  update: async (id, data) => {
    return await api.put(`/admin/students/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/admin/students/${id}`);
  }
};