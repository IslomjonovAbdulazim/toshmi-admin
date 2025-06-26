import api from './api';

export const groupService = {
  getAll: async () => {
    return await api.get('/admin/groups');
  },

  getById: async (id) => {
    return await api.get(`/admin/groups/${id}`);
  },

  create: async (data) => {
    return await api.post('/admin/groups', data);
  },

  update: async (id, data) => {
    return await api.put(`/admin/groups/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/admin/groups/${id}`);
  }
};