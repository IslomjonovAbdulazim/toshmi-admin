import { STORAGE_KEYS } from '../utils/constants';

class AuthService {
  // Get stored token
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  // Get stored user
  getUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Store authentication data
  setAuthData(token, user) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  // Clear authentication data
  clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check if token is expired
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decode JWT token (simple base64 decode)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  // Check user role
  hasRole(role) {
    const user = this.getUser();
    return user?.role === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Check if user is teacher
  isTeacher() {
    return this.hasRole('teacher');
  }

  // Check if user is student
  isStudent() {
    return this.hasRole('student');
  }

  // Check if user is parent
  isParent() {
    return this.hasRole('parent');
  }

  // Format user display name
  getUserDisplayName() {
    const user = this.getUser();
    if (!user) return 'Noma\'lum foydalanuvchi';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    if (user.full_name) {
      return user.full_name;
    }
    
    return user.phone || 'Foydalanuvchi';
  }

  // Get user initials for avatar
  getUserInitials() {
    const user = this.getUser();
    if (!user) return 'U';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    
    if (user.full_name) {
      const names = user.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      }
      return names[0].charAt(0).toUpperCase();
    }
    
    return 'U';
  }

  // Auto logout if token is expired
  checkTokenExpiry() {
    if (this.isAuthenticated() && this.isTokenExpired()) {
      this.clearAuthData();
      window.location.href = '/login';
      return false;
    }
    return true;
  }

  // Schedule token check
  scheduleTokenCheck() {
    // Check token every 5 minutes
    setInterval(() => {
      this.checkTokenExpiry();
    }, 5 * 60 * 1000);
  }

  // Get auth headers for API requests
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Logout and redirect
  logout() {
    this.clearAuthData();
    window.location.href = '/login';
  }
}

export default new AuthService();