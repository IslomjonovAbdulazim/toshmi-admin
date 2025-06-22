// Autentifikatsiya boshqaruvi

class Auth {
    constructor() {
        this.token = localStorage.getItem('admin_token');
        this.user = JSON.parse(localStorage.getItem('admin_user') || 'null');
        this.loginAttempts = parseInt(localStorage.getItem('login_attempts') || '0');
        this.lastAttempt = localStorage.getItem('last_attempt');
    }

    // Foydalanuvchi tizimga kirganmi?
    isLoggedIn() {
        return !!this.token && !!this.user;
    }

    // Admin rolimi?
    isAdmin() {
        return this.user && this.user.role === 'admin';
    }

    // Login urinishlari cheklovi
    canAttemptLogin() {
        if (this.loginAttempts < 5) return true;

        const lastAttemptTime = new Date(this.lastAttempt);
        const now = new Date();
        const timeDiff = now - lastAttemptTime;
        const waitTime = 15 * 60 * 1000; // 15 daqiqa

        return timeDiff > waitTime;
    }

    // Tizimga kirish
    async login(phone, password, remember = false) {
        try {
            // Login urinishlari cheklovini tekshirish
            if (!this.canAttemptLogin()) {
                const waitMinutes = Math.ceil((15 * 60 * 1000 - (new Date() - new Date(this.lastAttempt))) / 60000);
                showToast(`Juda ko'p noto'g'ri urinish. ${waitMinutes} daqiqadan so'ng qayta urinib ko'ring.`, 'error');
                return false;
            }

            // Loading holatini ko'rsatish
            const loginBtn = document.getElementById('login-btn');
            const loginText = document.getElementById('login-text');
            const loginSpinner = document.getElementById('login-spinner');
            const errorMessage = document.getElementById('error-message');

            if (loginBtn) loginBtn.disabled = true;
            if (loginText) loginText.textContent = 'Kirish...';
            if (loginSpinner) loginSpinner.classList.remove('hidden');
            if (errorMessage) errorMessage.classList.add('hidden');

            // API so'rovi
            const response = await AuthAPI.login(parseInt(phone), password, 'admin');

            if (response && response.access_token) {
                // Tokenni saqlash
                this.token = response.access_token;
                localStorage.setItem('admin_token', this.token);
                api.setToken(this.token);

                // Foydalanuvchi ma'lumotlarini olish
                const userInfo = await AuthAPI.getMe();
                this.user = userInfo;
                localStorage.setItem('admin_user', JSON.stringify(userInfo));

                // Remember me funksiyasi
                if (remember) {
                    localStorage.setItem('remember_admin', 'true');
                    localStorage.setItem('admin_phone', phone);
                } else {
                    localStorage.removeItem('remember_admin');
                    localStorage.removeItem('admin_phone');
                }

                // Login urinishlarini tozalash
                this.resetLoginAttempts();

                // Muvaffaqiyat xabari
                showToast('Muvaffaqiyatli kirdingiz!', 'success');

                // Asosiy sahifaga yo'naltirish
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);

                return true;
            }

        } catch (error) {
            console.error('Login xatosi:', error);
            
            // Xato urinishlarni sanash
            this.incrementLoginAttempts();

            // Xato xabarini ko'rsatish
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.textContent = this.getErrorMessage(error.message);
                errorMessage.classList.remove('hidden');
            }

            showToast(this.getErrorMessage(error.message), 'error');

        } finally {
            // Loading holatini o'chirish
            const loginBtn = document.getElementById('login-btn');
            const loginText = document.getElementById('login-text');
            const loginSpinner = document.getElementById('login-spinner');

            if (loginBtn) loginBtn.disabled = false;
            if (loginText) loginText.textContent = 'Kirish';
            if (loginSpinner) loginSpinner.classList.add('hidden');
        }

        return false;
    }

    // Tizimdan chiqish
    async logout() {
        try {
            // API orqali logout
            await AuthAPI.logout();
        } catch (error) {
            console.error('Logout xatosi:', error);
        } finally {
            // Local ma'lumotlarni tozalash
            this.token = null;
            this.user = null;
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            localStorage.removeItem('remember_admin');
            api.setToken(null);

            // Login sahifasiga yo'naltirish
            showToast('Tizimdan muvaffaqiyatli chiqdingiz', 'info');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }

    // Parolni o'zgartirish
    async changePassword(currentPassword, newPassword) {
        try {
            await AuthAPI.changePassword(currentPassword, newPassword);
            showToast('Parol muvaffaqiyatli o\'zgartirildi', 'success');
            return true;
        } catch (error) {
            console.error('Parol o\'zgartirish xatosi:', error);
            showToast(this.getErrorMessage(error.message), 'error');
            return false;
        }
    }

    // Foydalanuvchi ma'lumotlarini yangilash
    async refreshUser() {
        try {
            const userInfo = await AuthAPI.getMe();
            this.user = userInfo;
            localStorage.setItem('admin_user', JSON.stringify(userInfo));
            this.updateUserDisplay();
        } catch (error) {
            console.error('Foydalanuvchi ma\'lumotlarini yangilash xatosi:', error);
        }
    }

    // Login urinishlarini oshirish
    incrementLoginAttempts() {
        this.loginAttempts++;
        this.lastAttempt = new Date().toISOString();
        localStorage.setItem('login_attempts', this.loginAttempts.toString());
        localStorage.setItem('last_attempt', this.lastAttempt);
    }

    // Login urinishlarini tozalash
    resetLoginAttempts() {
        this.loginAttempts = 0;
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('last_attempt');
    }

    // Xato xabarlarini formatlash
    getErrorMessage(message) {
        const errorMessages = {
            'Invalid credentials': 'Telefon raqam yoki parol noto\'g\'ri',
            'User not found': 'Foydalanuvchi topilmadi',
            'Could not validate credentials': 'Kirishda xatolik yuz berdi',
            'Admin access required': 'Admin huquqi talab qilinadi',
            'Too many requests': 'Juda ko\'p so\'rov yuborildi. Biroz kuting.'
        };

        return errorMessages[message] || message || 'Noma\'lum xato yuz berdi';
    }

    // Foydalanuvchi ma'lumotlarini ko'rsatish
    updateUserDisplay() {
        if (!this.user) return;

        // Header dagi foydalanuvchi nomi
        const userNames = document.querySelectorAll('#user-name, #sidebar-user-name');
        userNames.forEach(element => {
            if (element) element.textContent = this.user.full_name || 'Admin';
        });

        // Avatar rasmlarini yangilash
        const avatars = document.querySelectorAll('#user-avatar, #sidebar-user-avatar');
        avatars.forEach(avatar => {
            if (avatar) {
                if (this.user.avatar_url) {
                    avatar.src = this.user.avatar_url;
                } else {
                    avatar.src = generateAvatar(this.user.full_name);
                }
            }
        });
    }

    // Token amal qilish muddatini tekshirish
    isTokenExpired() {
        if (!this.token) return true;

        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Token tekshirish xatosi:', error);
            return true;
        }
    }

    // Sahifa yuklanishda tekshirish
    initAuth() {
        // Agar login sahifada bo'lsak va allaqachon kirgan bo'lsak
        if (window.location.pathname.includes('login.html') && this.isLoggedIn() && !this.isTokenExpired()) {
            window.location.href = 'index.html';
            return;
        }

        // Agar boshqa sahifada bo'lsak va kirish talab qilinsa
        if (!window.location.pathname.includes('login.html')) {
            if (!this.isLoggedIn() || this.isTokenExpired()) {
                window.location.href = 'login.html';
                return;
            }

            // Admin roli tekshiruvi
            if (!this.isAdmin()) {
                showToast('Admin huquqi talab qilinadi', 'error');
                this.logout();
                return;
            }

            // Foydalanuvchi ma'lumotlarini ko'rsatish
            this.updateUserDisplay();
        }

        // Remember me funksiyasi
        if (window.location.pathname.includes('login.html')) {
            const rememberCheckbox = document.getElementById('remember');
            const phoneInput = document.getElementById('phone');
            
            if (localStorage.getItem('remember_admin') === 'true') {
                if (rememberCheckbox) rememberCheckbox.checked = true;
                if (phoneInput) phoneInput.value = localStorage.getItem('admin_phone') || '';
            }
        }
    }

    // Tokenni avtomatik yangilash (agar backend qo'llab-quvvatlasa)
    async refreshToken() {
        try {
            // Bu funksiya backend refresh token endpointini qo'llab-quvvatlasa ishlaydi
            const response = await api.post('/auth/refresh-token');
            if (response.access_token) {
                this.token = response.access_token;
                localStorage.setItem('admin_token', this.token);
                api.setToken(this.token);
                return true;
            }
        } catch (error) {
            console.error('Token yangilash xatosi:', error);
            this.logout();
        }
        return false;
    }

    // Sessiya faolligini kuzatish
    setupSessionMonitoring() {
        // Har 5 daqiqada token holatini tekshirish
        setInterval(() => {
            if (this.isLoggedIn() && this.isTokenExpired()) {
                showToast('Sessiya muddati tugadi. Qaytadan kiring.', 'warning');
                this.logout();
            }
        }, 5 * 60 * 1000);

        // Sahifa faolligini kuzatish
        let lastActivity = Date.now();
        const maxInactivity = 30 * 60 * 1000; // 30 daqiqa

        document.addEventListener('click', () => lastActivity = Date.now());
        document.addEventListener('keypress', () => lastActivity = Date.now());
        document.addEventListener('scroll', () => lastActivity = Date.now());

        setInterval(() => {
            if (this.isLoggedIn() && Date.now() - lastActivity > maxInactivity) {
                showToast('Faolsizlik tufayli tizimdan chiqarildingiz', 'info');
                this.logout();
            }
        }, 60 * 1000); // Har daqiqada tekshirish
    }
}

// Global Auth obyektini yaratish
const auth = new Auth();

// Sahifa yuklanishda autentifikatsiyani tekshirish
document.addEventListener('DOMContentLoaded', () => {
    auth.initAuth();
    
    // Logout tugmalari uchun event listenerlar
    document.addEventListener('click', (e) => {
        if (e.target.id === 'logout-btn' || e.target.id === 'sidebar-logout-btn') {
            e.preventDefault();
            showConfirmModal(
                'Tizimdan chiqish',
                'Haqiqatan ham tizimdan chiqmoqchimisiz?',
                () => auth.logout()
            );
        }
    });

    // Sessiya monitoringini boshlash
    if (auth.isLoggedIn()) {
        auth.setupSessionMonitoring();
    }
});

// Global export
if (typeof window !== 'undefined') {
    window.Auth = auth;
}