import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: this.getAuthHeaders(),
      mode: 'cors',
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Handle unauthorized
      if (response.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
        return;
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      
      // Network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Serverga ulanishda xatolik. Backend server ishlamayotgan bo\'lishi mumkin.');
      }
      
      // CORS errors
      if (error.message.includes('CORS')) {
        throw new Error('CORS xatoligi. Backend CORS sozlamalarini tekshiring.');
      }
      
      throw error;
    }
  }

  // File upload method
  async uploadFile(endpoint, file, additionalData = {}) {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
  }

  // ===== AUTHENTICATION ENDPOINTS =====
  
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(data) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async changePassword(data) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // ===== NOTIFICATION ENDPOINTS =====
  
  async getNotifications() {
    return this.request('/auth/notifications');
  }

  async markNotificationRead(id) {
    return this.request(`/auth/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsRead() {
    return this.request('/auth/notifications/mark-all-read', {
      method: 'PUT'
    });
  }

  async getUnreadCount() {
    return this.request('/auth/notifications/unread-count');
  }

  // ===== STUDENT MANAGEMENT =====
  
  async getStudents() {
    return this.request('/admin/students');
  }

  async getStudent(id) {
    return this.request(`/admin/students/${id}`);
  }

  async createStudent(data) {
    return this.request('/admin/students', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateStudent(id, data) {
    return this.request(`/admin/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteStudent(id) {
    return this.request(`/admin/students/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== TEACHER MANAGEMENT =====
  
  async getTeachers() {
    return this.request('/admin/teachers');
  }

  async getTeacher(id) {
    return this.request(`/admin/teachers/${id}`);
  }

  async createTeacher(data) {
    return this.request('/admin/teachers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateTeacher(id, data) {
    return this.request(`/admin/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteTeacher(id) {
    return this.request(`/admin/teachers/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== PARENT MANAGEMENT =====
  
  async getParents() {
    return this.request('/admin/parents');
  }

  async createParent(data) {
    return this.request('/admin/parents', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateParent(id, data) {
    return this.request(`/admin/parents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteParent(id) {
    return this.request(`/admin/parents/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== GROUP MANAGEMENT =====
  
  async getGroups() {
    return this.request('/admin/groups');
  }

  async getGroup(id) {
    return this.request(`/admin/groups/${id}`);
  }

  async createGroup(data) {
    return this.request('/admin/groups', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateGroup(id, data) {
    return this.request(`/admin/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteGroup(id) {
    return this.request(`/admin/groups/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== SUBJECT MANAGEMENT =====
  
  async getSubjects() {
    return this.request('/admin/subjects');
  }

  async getSubject(id) {
    return this.request(`/admin/subjects/${id}`);
  }

  async createSubject(data) {
    return this.request('/admin/subjects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateSubject(id, data) {
    return this.request(`/admin/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteSubject(id) {
    return this.request(`/admin/subjects/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== TEACHER ASSIGNMENT =====
  
  async assignTeacher(data) {
    return this.request('/admin/assign-teacher', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ===== PAYMENT MANAGEMENT =====
  
  async createPayment(data) {
    return this.request('/admin/payments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ===== NEWS MANAGEMENT =====
  
  async getNews() {
    return this.request('/admin/news');
  }

  async getNewsArticle(id) {
    return this.request(`/admin/news/${id}`);
  }

  async createNews(data) {
    return this.request('/admin/news', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateNews(id, data) {
    return this.request(`/admin/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteNews(id) {
    return this.request(`/admin/news/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== SCHEDULE MANAGEMENT =====
  
  async getSchedules() {
    return this.request('/admin/schedule');
  }

  async getSchedule(id) {
    return this.request(`/admin/schedule/${id}`);
  }

  async createSchedule(data) {
    return this.request('/admin/schedule', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateSchedule(id, data) {
    return this.request(`/admin/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteSchedule(id) {
    return this.request(`/admin/schedule/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== FILE MANAGEMENT =====
  
  async uploadProfilePicture(file) {
    return this.uploadFile('/files/profile-picture', file);
  }

  async uploadHomeworkFile(homeworkId, file) {
    return this.uploadFile(`/files/homework/${homeworkId}/upload`, file);
  }

  async uploadExamFile(examId, file) {
    return this.uploadFile(`/files/exam/${examId}/upload`, file);
  }

  async uploadNewsImage(newsId, file) {
    return this.uploadFile(`/files/news/${newsId}/upload-image`, file);
  }

  async downloadFile(fileId) {
    return this.request(`/files/${fileId}`);
  }

  async deleteFile(fileId) {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE'
    });
  }

  // ===== UTILITY METHODS =====
  
  // Get system health
  async getHealth() {
    return this.request('/health');
  }

  // Get system stats
  async getStats() {
    return this.request('/stats');
  }

  // Initialize database (if needed)
  async initializeDatabase() {
    return this.request('/init-db', {
      method: 'POST'
    });
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;