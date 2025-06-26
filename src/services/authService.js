import api from './api';

export const authService = {
  login: async (phone, password, role) => {
    return await api.post('/auth/login', {
      phone,
      password,
      role
    });
  },

  getProfile: async () => {
    return await api.get('/auth/profile');
  },

  changePassword: async (oldPassword, newPassword) => {
    return await api.put('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword
    });
  },

  updateProfile: async (firstName, lastName) => {
    return await api.put('/auth/profile', {
      first_name: firstName,
      last_name: lastName
    });
  }
};