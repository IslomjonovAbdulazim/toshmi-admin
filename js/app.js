// Asosiy ilovani boshqarish

class SchoolAdminApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.isInitialized = false;
        this.init();
    }

    // Ilovani ishga tushirish
    async init() {
        try {
            // Auth tekshiruvi
            if (!auth.isLoggedIn()) {
                window.location.href = 'login.html';
                return;
            }

            // Komponentlarni yuklash
            await this.loadComponents();
            
            // Global event listenerlarni sozlash
            this.setupGlobalEventListeners();
            
            // Dastlabki sahifani aniqlash
            this.determineInitialPage();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Ilovani ishga tushirishda xato:', error);
            showToast('Ilovani yuklashda xato yuz berdi', 'error');
        }
    }

    // Komponentlarni yuklash
    async loadComponents() {
        try {
            // Header yuklash
            await this.loadComponent('header-container', 'components/header.html');
            
            // Sidebar yuklash (desktop uchun)
            if (window.innerWidth >= 1024) {
                await this.loadComponent('sidebar-container', 'components/sidebar.html');
            }
            
            // Modallar yuklash
            await this.loadComponent('modals-container', 'components/modals.html');
            
        } catch (error) {
            console.error('Komponentlarni yuklashda xato:', error);
        }
    }

    // Bitta komponentni yuklash
    async loadComponent(containerId, filePath) {
        try {
            const response = await fetch(filePath);
            const html = await response.text();
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = html;
            }
        } catch (error) {
            console.error(`Komponent yuklash xatosi: ${filePath}`, error);
        }
    }

    // Global event listenerlarni sozlash
    setupGlobalEventListeners() {
        // Navigation handling
        document.addEventListener('click', (e) => {
            // Navigation tabs
            if (e.target.classList.contains('nav-tab') || 
                e.target.classList.contains('nav-tab-dropdown') || 
                e.target.classList.contains('sidebar-nav-item')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                if (page && page !== this.currentPage) {
                    this.navigateToPage(page);
                }
            }

            // Mobile menu toggle
            if (e.target.id === 'mobile-menu-btn' || e.target.closest('#mobile-menu-btn')) {
                this.toggleMobileMenu();
            }

            // Modal close buttons
            if (e.target.classList.contains('modal-close')) {
                closeModal();
            }

            // Logout buttons
            if (e.target.id === 'logout-btn' || e.target.id === 'sidebar-logout-btn') {
                e.preventDefault();
                this.handleLogout();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        // Before unload
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });

        // Online/offline status
        window.addEventListener('online', () => {
            showToast('Internet aloqasi tiklandi', 'success');
        });

        window.addEventListener('offline', () => {
            showToast('Internet aloqasi yo\'qoldi', 'warning');
        });
    }

    // Dastlabki sahifani aniqlash
    determineInitialPage() {
        // URL parametrlaridan sahifani olish
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        
        if (pageParam && this.isValidPage(pageParam)) {
            this.navigateToPage(pageParam);
        } else {
            this.navigateToPage('dashboard');
        }
    }

    // Sahifa mavjudligini tekshirish
    isValidPage(pageName) {
        const validPages = ['dashboard', 'users', 'students', 'academic', 'schedule', 'payments', 'news', 'reports'];
        return validPages.includes(pageName);
    }

    // Sahifaga o'tish
    async navigateToPage(pageName) {
        try {
            if (!this.isValidPage(pageName)) {
                throw new Error(`Noto'g'ri sahifa: ${pageName}`);
            }

            showLoading();

            // Avvalgi sahifa tablarini nofaol qilish
            this.deactivateAllTabs();

            // Yangi sahifa tabini faol qilish
            this.activateTab(pageName);

            // Sahifa kontentini yuklash
            await this.loadPageContent(pageName);

            // Sahifaga xos skriptlarni ishga tushirish
            this.initPageModule(pageName);

            this.currentPage = pageName;
            this.updateURL(pageName);
            this.closeMobileMenu();

        } catch (error) {
            console.error('Sahifaga o\'tishda xato:', error);
            showToast('Sahifani yuklashda xato yuz berdi', 'error');
        } finally {
            hideLoading();
        }
    }

    // Sahifa kontentini yuklash
    async loadPageContent(pageName) {
        const response = await fetch(`pages/${pageName}.html`);
        if (!response.ok) {
            throw new Error(`Sahifa topilmadi: ${pageName}`);
        }

        const html = await response.text();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = html;
        }
    }

    // Sahifa modulini ishga tushirish
    initPageModule(pageName) {
        const moduleMap = {
            'dashboard': 'Dashboard',
            'users': 'Users',
            'students': 'Students',
            'academic': 'Academic',
            'schedule': 'Schedule',
            'payments': 'Payments',
            'news': 'News',
            'reports': 'Reports'
        };

        const moduleName = moduleMap[pageName];
        if (moduleName && window[moduleName] && typeof window[moduleName].init === 'function') {
            window[moduleName].init();
        }
    }

    // Barcha tablarni nofaol qilish
    deactivateAllTabs() {
        const tabs = document.querySelectorAll('.nav-tab, .sidebar-nav-item');
        tabs.forEach(tab => tab.classList.remove('active'));
    }

    // Tanlangan tabni faol qilish
    activateTab(pageName) {
        const tabs = document.querySelectorAll(`[data-page="${pageName}"]`);
        tabs.forEach(tab => tab.classList.add('active'));
    }

    // URL ni yangilash
    updateURL(pageName) {
        const url = new URL(window.location);
        url.searchParams.set('page', pageName);
        window.history.replaceState({ page: pageName }, '', url);
    }

    // Mobile menuni ochish/yopish
    toggleMobileMenu() {
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileNav) {
            if (mobileNav.classList.contains('hidden')) {
                this.openMobileMenu();
            } else {
                this.closeMobileMenu();
            }
        }
    }

    openMobileMenu() {
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileNav) {
            mobileNav.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeMobileMenu() {
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileNav) {
            mobileNav.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    // Chiqish jarayonini boshqarish
    handleLogout() {
        showConfirmModal(
            'Tizimdan chiqish',
            'Haqiqatan ham tizimdan chiqmoqchimisiz?',
            () => {
                auth.logout();
            }
        );
    }

    // Klaviatura shortcutlari
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K - Qidiruv
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.openGlobalSearch();
        }

        // Escape - Modal/menu yopish
        if (e.key === 'Escape') {
            closeModal();
            this.closeMobileMenu();
        }

        // Alt + raqamlar - sahifalar orasida tez o'tish
        if (e.altKey && !isNaN(e.key)) {
            e.preventDefault();
            const pages = ['dashboard', 'users', 'students', 'academic', 'schedule', 'payments', 'news', 'reports'];
            const pageIndex = parseInt(e.key) - 1;
            if (pages[pageIndex]) {
                this.navigateToPage(pages[pageIndex]);
            }
        }

        // F5 - Sahifani yangilash
        if (e.key === 'F5') {
            e.preventDefault();
            this.refreshCurrentPage();
        }
    }

    // Window resize ni boshqarish
    handleWindowResize() {
        const width = window.innerWidth;
        
        if (width >= 1024) {
            // Desktop
            this.closeMobileMenu();
        }
    }

    // Sahifani tark etishdan oldin
    handleBeforeUnload(e) {
        // Agar formada o'zgarishlar bo'lsa, ogohlantirish
        const forms = document.querySelectorAll('form');
        let hasChanges = false;

        forms.forEach(form => {
            if (form.classList.contains('has-changes')) {
                hasChanges = true;
            }
        });

        if (hasChanges) {
            e.preventDefault();
            e.returnValue = 'Saqlalmagan o\'zgarishlar mavjud. Sahifani tark etmoqchimisiz?';
        }
    }

    // Global qidiruvni ochish
    openGlobalSearch() {
        // Bu yerda global qidiruv modali ochiladi
        showToast('Global qidiruv tez orada qo\'shiladi', 'info');
    }

    // Joriy sahifani yangilash
    refreshCurrentPage() {
        if (this.currentPage) {
            this.navigateToPage(this.currentPage);
        }
    }

    // App holati haqida ma'lumot
    getAppInfo() {
        return {
            currentPage: this.currentPage,
            isInitialized: this.isInitialized,
            user: auth.user,
            version: '1.0.0'
        };
    }

    // Xatolikni global boshqarish
    handleGlobalError(error, context = 'Unknown') {
        console.error(`Global xato [${context}]:`, error);
        
        const errorMessage = error.message || 'Noma\'lum xato yuz berdi';
        showToast(errorMessage, 'error');

        // Kritik xatolik bo'lsa, sahifani qayta yuklash
        if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
            showConfirmModal(
                'Xato',
                'Ilovani yuklashda muammo. Sahifani qayta yuklaymizmi?',
                () => window.location.reload()
            );
        }
    }

    // Performance monitoring
    trackPageLoad(pageName, startTime) {
        const loadTime = performance.now() - startTime;
        console.log(`Sahifa yuklash vaqti [${pageName}]: ${loadTime.toFixed(2)}ms`);
        
        // Sekin yuklansa ogohlantirish
        if (loadTime > 3000) {
            console.warn(`Sekin sahifa yuklandi: ${pageName}`);
        }
    }
}

// Global error handling
window.addEventListener('error', (e) => {
    if (window.app) {
        window.app.handleGlobalError(e.error, 'Window Error');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    if (window.app) {
        window.app.handleGlobalError(e.reason, 'Unhandled Promise');
    }
});

// DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    // App ni ishga tushirish
    window.app = new SchoolAdminApp();
    
    // Development mode uchun global funksiyalar
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.debugApp = () => console.log(window.app.getAppInfo());
        window.refreshPage = () => window.app.refreshCurrentPage();
        console.log('🏫 Maktab Admin Panel - Development Mode');
        console.log('Available debug commands: debugApp(), refreshPage()');
    }
});

// Service Worker registration (agar kerak bo'lsa)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SchoolAdminApp;
}