import api from './api';

export const scheduleService = {
  getAll: async () => {
    return await api.get('/admin/schedule');
  },

  getById: async (id) => {
    return await api.get(`/admin/schedule/${id}`);
  },

  create: async (data) => {
    return await api.post('/admin/schedule', data);
  },

  update: async (id, data) => {
    return await api.put(`/admin/schedule/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/admin/schedule/${id}`);
  },

  // Helper method to get schedules by group
  getByGroup: async (groupId) => {
    const response = await api.get('/admin/schedule');
    return response.data.filter(schedule => schedule.group_id === groupId);
  },

  // Helper method to format day names
  getDayName: (dayIndex) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayIndex] || 'Invalid Day';
  },

  // Helper method to format time
  formatTime: (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // Convert "HH:MM:SS" to "HH:MM"
  }
};