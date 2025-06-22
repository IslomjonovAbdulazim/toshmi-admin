import { API_BASE_URL } from '../utils/constants';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API xatolik:', error);
      throw error;
    }
  }

  // Auth
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Users
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/users?${query}`);
  }

  async createUser(userData) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(userId, userData) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }

  async resetUserPassword(userId) {
    return this.request(`/admin/users/${userId}/reset-password`, {
      method: 'POST'
    });
  }

  // Students
  async searchStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/students/search?${query}`);
  }

  async createStudent(studentData) {
    return this.request('/admin/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  // Groups
  async getGroups() {
    return this.request('/admin/groups');
  }

  async createGroup(groupData) {
    return this.request('/admin/groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    });
  }

  // Subjects
  async getSubjects() {
    return this.request('/admin/subjects');
  }

  async createSubject(subjectData) {
    return this.request('/admin/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData)
    });
  }

  // Payments
  async getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/payments?${query}`);
  }

  async createPayment(paymentData) {
    return this.request('/admin/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async updatePayment(paymentId, updateData) {
    return this.request(`/admin/payments/${paymentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
  }

  // News
  async getNews() {
    return this.request('/admin/news');
  }

  async createNews(newsData) {
    return this.request('/admin/news', {
      method: 'POST',
      body: JSON.stringify(newsData)
    });
  }

  async deleteNews(newsId) {
    return this.request(`/admin/news/${newsId}`, {
      method: 'DELETE'
    });
  }

  // Reports
  async getOverviewReport() {
    return this.request('/admin/reports/overview');
  }

  async getClassReport(groupId, subjectId) {
    return this.request(`/admin/reports/class?group_id=${groupId}&subject_id=${subjectId}`);
  }

  async getPaymentReport(month, year) {
    return this.request(`/admin/reports/payments?month=${month}&year=${year}`);
  }

  // File upload
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/admin/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Rasm yuklashda xatolik');
    }

    return await response.json();
  }
}

const apiService = new ApiService();
export default apiService;