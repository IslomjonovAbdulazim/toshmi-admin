// API so'rovlari uchun yordamchi funksiyalar

// Backend URL konfiguratsiyasi
const API_BASE_URL = 'http://localhost:8000'; // Bu yerda haqiqiy backend URL ni kiriting

// API so'rovlari sinfi
class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('admin_token');
    }

    // Tokenni o'rnatish
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('admin_token', token);
        } else {
            localStorage.removeItem('admin_token');
        }
    }

    // So'rov headerlarini olish
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Asosiy so'rov funksiyasi
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Token yaroqsiz bo'lsa
            if (response.status === 401) {
                this.setToken(null);
                window.location.href = 'login.html';
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'So\'rov bajarilmadi');
            }

            return data;
        } catch (error) {
            console.error('API xatosi:', error);
            throw error;
        }
    }

    // GET so'rovi
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST so'rovi
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT so'rovi
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // PATCH so'rovi
    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    // DELETE so'rovi
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Fayl yuklash
    async uploadFile(endpoint, file) {
        const formData = new FormData();
        formData.append('file', file);

        const url = `${this.baseURL}${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': this.token ? `Bearer ${this.token}` : undefined
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Fayl yuklanmadi');
        }

        return response.json();
    }
}

// API mijoz yaratish
const api = new ApiClient();

// Auth API funksiyalari
const AuthAPI = {
    async login(phone, password, role = 'admin') {
        return api.post('/auth/login', { phone, password, role });
    },

    async logout() {
        return api.post('/auth/logout', {});
    },

    async getMe() {
        return api.get('/auth/me');
    },

    async changePassword(currentPassword, newPassword) {
        return api.post('/auth/change-password', {
            current_password: currentPassword,
            new_password: newPassword
        });
    }
};

// Users API funksiyalari
const UsersAPI = {
    async getUsers(role = null, page = 1, size = 20) {
        const params = new URLSearchParams();
        if (role) params.append('role', role);
        params.append('page', page.toString());
        params.append('size', size.toString());
        
        return api.get(`/admin/users?${params}`);
    },

    async getUser(userId) {
        return api.get(`/admin/users/${userId}`);
    },

    async createUser(userData) {
        return api.post('/admin/users', userData);
    },

    async updateUser(userId, userData) {
        return api.patch(`/admin/users/${userId}`, userData);
    },

    async deleteUser(userId) {
        return api.delete(`/admin/users/${userId}`);
    },

    async changeUserPassword(userId, newPassword) {
        return api.patch(`/admin/users/${userId}/password`, {
            new_password: newPassword
        });
    },

    async resetUserPassword(userId) {
        return api.post(`/admin/users/${userId}/reset-password`);
    }
};

// Students API funksiyalari
const StudentsAPI = {
    async getStudents() {
        return api.get('/admin/students');
    },

    async createStudent(studentData) {
        return api.post('/admin/students', studentData);
    },

    async enrollStudent(studentId, groupId) {
        return api.post('/admin/students/enroll', {
            student_id: studentId,
            group_id: groupId
        });
    },

    async transferStudents(studentIds, fromGroupId, toGroupId) {
        return api.post('/admin/students/transfer', {
            student_ids: studentIds,
            from_group_id: fromGroupId,
            to_group_id: toGroupId
        });
    },

    async searchStudents(name = null, groupId = null, graduationYear = null) {
        const params = new URLSearchParams();
        if (name) params.append('name', name);
        if (groupId) params.append('group_id', groupId);
        if (graduationYear) params.append('graduation_year', graduationYear.toString());
        
        return api.get(`/admin/students/search?${params}`);
    }
};

// Groups API funksiyalari
const GroupsAPI = {
    async getGroups() {
        return api.get('/admin/groups');
    },

    async getGroup(groupId) {
        return api.get(`/admin/groups/${groupId}`);
    },

    async createGroup(groupData) {
        return api.post('/admin/groups', groupData);
    },

    async deleteGroup(groupId) {
        return api.delete(`/admin/groups/${groupId}`);
    }
};

// Subjects API funksiyalari
const SubjectsAPI = {
    async getSubjects() {
        return api.get('/admin/subjects');
    },

    async createSubject(subjectData) {
        return api.post('/admin/subjects', subjectData);
    },

    async deleteSubject(subjectId) {
        return api.delete(`/admin/subjects/${subjectId}`);
    }
};

// Group-Subjects API funksiyalari
const GroupSubjectsAPI = {
    async getGroupSubjects() {
        return api.get('/admin/group-subjects');
    },

    async createGroupSubject(data) {
        return api.post('/admin/group-subjects', data);
    },

    async updateGroupSubject(groupSubjectId, data) {
        return api.patch(`/admin/group-subjects/${groupSubjectId}`, data);
    },

    async deleteGroupSubject(groupSubjectId) {
        return api.delete(`/admin/group-subjects/${groupSubjectId}`);
    }
};

// Schedule API funksiyalari
const ScheduleAPI = {
    async getSchedule(groupId, dayOfWeek = null) {
        const params = new URLSearchParams();
        params.append('group_id', groupId);
        if (dayOfWeek) params.append('day_of_week', dayOfWeek);
        
        return api.get(`/schedule/schedule?${params}`);
    },

    async createSchedule(scheduleData) {
        return api.post('/schedule/schedule', scheduleData);
    },

    async updateSchedule(scheduleId, scheduleData) {
        return api.patch(`/schedule/schedule/${scheduleId}`, scheduleData);
    },

    async deleteSchedule(scheduleId) {
        return api.delete(`/schedule/schedule/${scheduleId}`);
    }
};

// Payments API funksiyalari
const PaymentsAPI = {
    async getPayments(month = null, year = null) {
        const params = new URLSearchParams();
        if (month) params.append('month', month.toString());
        if (year) params.append('year', year.toString());
        
        return api.get(`/admin/payments?${params}`);
    },

    async createPayment(paymentData) {
        return api.post('/admin/payments', paymentData);
    },

    async updatePayment(paymentId, isFullyPaid, comment = null) {
        return api.patch(`/admin/payments/${paymentId}`, {
            is_fully_paid: isFullyPaid,
            comment: comment
        });
    }
};

// News API funksiyalari
const NewsAPI = {
    async getNews() {
        return api.get('/admin/news');
    },

    async createNews(newsData) {
        return api.post('/admin/news', newsData);
    },

    async deleteNews(newsId) {
        return api.delete(`/admin/news/${newsId}`);
    }
};

// Reports API funksiyalari
const ReportsAPI = {
    async getClassReport(groupId, subjectId) {
        return api.get(`/admin/reports/class?group_id=${groupId}&subject_id=${subjectId}`);
    },

    async getPaymentReport(month, year) {
        return api.get(`/admin/reports/payments?month=${month}&year=${year}`);
    },

    async getSchoolOverview() {
        return api.get('/admin/reports/overview');
    }
};

// Search API funksiyalari
const SearchAPI = {
    async searchStudents(name = null, groupId = null, graduationYear = null, page = 1, size = 20) {
        const params = new URLSearchParams();
        if (name) params.append('name', name);
        if (groupId) params.append('group_id', groupId);
        if (graduationYear) params.append('graduation_year', graduationYear.toString());
        params.append('page', page.toString());
        params.append('size', size.toString());
        
        return api.get(`/search/students?${params}`);
    },

    async filterGrades(studentId = null, subjectId = null, dateFrom = null, dateTo = null, page = 1, size = 20) {
        const params = new URLSearchParams();
        if (studentId) params.append('student_id', studentId);
        if (subjectId) params.append('subject_id', subjectId);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        params.append('page', page.toString());
        params.append('size', size.toString());
        
        return api.get(`/search/grades?${params}`);
    }
};

// Files API funksiyalari
const FilesAPI = {
    async uploadFile(file) {
        return api.uploadFile('/files/upload', file);
    },

    async uploadAvatar(file) {
        return api.uploadFile('/files/upload-avatar', file);
    },

    async getMyFiles() {
        return api.get('/files/my-files');
    },

    async deleteFile(filePath) {
        return api.delete(`/files/delete/${filePath}`);
    }
};

// Demo ma'lumotlari (development uchun)
const DemoAPI = {
    // Agar backend mavjud bo'lmasa, demo ma'lumotlarni qaytarish
    async getDemoUsers() {
        return [
            {
                id: '1',
                full_name: 'Admin User',
                phone: 990330919,
                role: 'admin',
                created_at: new Date().toISOString()
            },
            {
                id: '2',
                full_name: 'O\'qituvchi Aziz',
                phone: 901234567,
                role: 'teacher',
                created_at: new Date().toISOString()
            }
        ];
    },

    async getDemoGroups() {
        return [
            { id: '1', name: '10A' },
            { id: '2', name: '10B' },
            { id: '3', name: '11A' }
        ];
    },

    async getDemoSubjects() {
        return [
            { id: '1', name: 'Matematika' },
            { id: '2', name: 'Fizika' },
            { id: '3', name: 'Kimyo' },
            { id: '4', name: 'Ingliz tili' }
        ];
    }
};

// Export qilish
if (typeof window !== 'undefined') {
    window.API = {
        api,
        AuthAPI,
        UsersAPI,
        StudentsAPI,
        GroupsAPI,
        SubjectsAPI,
        GroupSubjectsAPI,
        ScheduleAPI,
        PaymentsAPI,
        NewsAPI,
        ReportsAPI,
        SearchAPI,
        FilesAPI,
        DemoAPI
    };
}