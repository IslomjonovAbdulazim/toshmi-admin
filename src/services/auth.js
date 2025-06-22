// src/services/auth.js
import { API_BASE_URL } from '../utils/constants';

class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: parseInt(credentials.phone.replace(/[^\d]/g, '')),
          role: credentials.role,
          password: credentials.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Kirishda xatolik');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser() {
    const token = this.getToken();
    if (!token) {
      throw new Error('Token mavjud emas');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          throw new Error('Sessiya tugagan');
        }
        throw new Error('Foydalanuvchi ma\'lumotlarini olishda xatolik');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  isAdmin() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    try {
      const user = JSON.parse(userStr);
      return user.role === 'admin';
    } catch {
      return false;
    }
  }

  logout() {
    this.removeToken();
    window.location.href = '/login';
  }
}

export default new AuthService();