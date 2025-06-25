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
      
      throw error;
    }
  }

  // File upload method
  async uploadFile(endpoint, file) {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const formData = new FormData();
    formData.append('file', file);

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

  // ===== STUDENT MANAGEMENT =====
  
  async getStudents() {
    return this.request('/admin/students');
  }

  async getStudent(id) {
    return this.request(`/admin/students/${id}`);
  }

  async getStudentDetails(id) {
    const student = await this.getStudent(id);
    // Get additional details like grades, attendance
    try {
      const [grades, attendance] = await Promise.all([
        this.request(`/admin/students/${id}/grades`).catch(() => null),
        this.request(`/admin/students/${id}/attendance`).catch(() => null)
      ]);
      
      return {
        ...student,
        recent_grades: grades,
        attendance_summary: attendance
      };
    } catch (error) {
      return student;
    }
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

  async getTeacherDetails(id) {
    const teacher = await this.getTeacher(id);
    // Get assigned groups and subjects
    return teacher;
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

  // ===== TEACHER ASSIGNMENT (Simplified) =====
  
  async assignTeacher(data) {
    return this.request('/admin/assign-teacher', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getTeacherAssignments() {
    // Get all teachers with their assignments
    const teachers = await this.getTeachers();
    return teachers.filter(teacher => teacher.assigned_subjects && teacher.assigned_subjects.length > 0);
  }

  // ===== PAYMENT MANAGEMENT =====
  
  async createPayment(data) {
    return this.request('/admin/payments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getPayments(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/payments?${params}`);
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

  async downloadFile(fileId) {
    return this.request(`/files/${fileId}`);
  }

  async deleteFile(fileId) {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE'
    });
  }

  // ===== DASHBOARD & STATISTICS =====
  
  async getDashboardStats() {
    return this.request('/stats');
  }

  async getSystemHealth() {
    return this.request('/health');
  }

  // ===== UTILITY METHODS =====
  
  async initializeDatabase() {
    return this.request('/init-db', {
      method: 'POST'
    });
  }

  // Get academic summary for a student
  async getStudentAcademicSummary(studentId) {
    try {
      const [homework, exams, attendance] = await Promise.all([
        this.request(`/admin/students/${studentId}/homework-grades`).catch(() => []),
        this.request(`/admin/students/${studentId}/exam-grades`).catch(() => []),
        this.request(`/admin/students/${studentId}/attendance`).catch(() => [])
      ]);

      return {
        homework_grades: homework,
        exam_grades: exams,
        attendance_records: attendance
      };
    } catch (error) {
      console.error('Error getting student academic summary:', error);
      return null;
    }
  }

  // Get teacher's assigned classes
  async getTeacherAssignedClasses(teacherId) {
    try {
      const teacher = await this.getTeacher(teacherId);
      return teacher.assigned_subjects || [];
    } catch (error) {
      console.error('Error getting teacher assignments:', error);
      return [];
    }
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;