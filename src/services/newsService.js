import api from './api';

export const newsService = {
  getAll: async () => {
    return await api.get('/admin/news');
  },

  getById: async (id) => {
    return await api.get(`/admin/news/${id}`);
  },

  create: async (data) => {
    return await api.post('/admin/news', data);
  },

  update: async (id, data) => {
    return await api.put(`/admin/news/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/admin/news/${id}`);
  },

  uploadImage: async (newsId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post(`/files/news/${newsId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteFile: async (fileId) => {
    return await api.delete(`/files/${fileId}`);
  }
};