import api from './api';

export const systemService = {
  getStats: async () => {
    return await api.get('/stats');
  }
};