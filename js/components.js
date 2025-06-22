// UI komponenti boshqaruvi

class ComponentManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.sidebarOpen = false;
        this.init();
    }

    // Komponentlarni yuklash va sozlash
    async init() {
        await this.loadComponents();
        this.setupEventListeners();
        this.setupMobileMenu();
        this.loadPage(this.currentPage);
    }

    // Komponentlarni yuklash
    async loadComponents() {
        try {
            // Header komponentini yuklash
            const headerResponse = await fetch('components/header.html');
            const headerHTML = await headerResponse.text();
            const headerContainer = document.getElementById('header-container');
            if (headerContainer) {
                headerContainer.innerHTML = headerHTML;
            }

            // Sidebar komponentini yuklash (faqat desktop uchun)
            if (window.innerWidth >= 1024) {
                const sidebarResponse = await fetch('components/sidebar.html');
                const sidebarHTML = await sidebarResponse.text();
                const sidebarContainer = document.getElementById('sidebar-container');
                if (sidebarContainer) {
                    sidebarContainer.innerHTML = sidebarHTML;
                    sidebarContainer.classList.remove('hidden');
                }
            }

            // Modallar komponentini yuklash
            const modalsResponse = await fetch('components/modals.html');
            const modalsHTML = await modalsResponse.text();
            const modalsContainer = document.getElementById('modals-container');
            if (modalsContainer) {
                modalsContainer.innerHTML = modalsHTML;
            }

        } catch (error) {
            console.error('Komponentlarni yuklashda xato:', error);
        }
    }

    // Event listenerlarni sozlash
    setupEventListeners() {
        // Navigation tablar
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-tab') || e.target.classList.contains('nav-tab-dropdown') || e.target.classList.contains('sidebar-nav-item')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                if (page) {
                    this.loadPage(page);
                }
            }
        });

        // Mobile menu tugmasi
        document.addEventListener('click', (e) => {
            if (e.target.id === 'mobile-menu-btn' || e.target.closest('#mobile-menu-btn')) {
                this.toggleMobileMenu();
            }
        });

        // Window resize event
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    // Mobile menu sozlamalari
    setupMobileMenu() {
        const mobileNav = document.getElementById('mobile-nav');
        const sidebarContainer = document.getElementById('sidebar-container');

        if (mobileNav && sidebarContainer) {
            // Mobile nav ga sidebar kontentini ko'chirish
            const mobileNavContent = document.getElementById('mobile-nav-content');
            if (mobileNavContent) {
                mobileNavContent.innerHTML = sidebarContainer.innerHTML;
            }

            // Mobile nav yopish
            mobileNav.addEventListener('click', (e) => {
                if (e.target === mobileNav) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    // Mobile menuni ochish/yopish
    toggleMobileMenu() {
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileNav) {
            if (this.sidebarOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }

    openMobileMenu() {
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileNav) {
            mobileNav.classList.remove('hidden');
            this.sidebarOpen = true;
            document.body.style.overflow = 'hidden';
        }
    }

    closeMobileMenu() {
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileNav) {
            mobileNav.classList.add('hidden');
            this.sidebarOpen = false;
            document.body.style.overflow = 'auto';
        }
    }

    // Sahifani yuklash
    async loadPage(pageName) {
        try {
            showLoading();
            
            // Avvalgi sahifa tabini nofaol qilish
            this.deactivateAllTabs();
            
            // Yangi sahifa tabini faol qilish
            this.activateTab(pageName);
            
            // Sahifa kontentini yuklash
            const response = await fetch(`pages/${pageName}.html`);
            if (!response.ok) {
                throw new Error(`Sahifa topilmadi: ${pageName}`);
            }
            
            const html = await response.text();
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = html;
            }

            // Sahifaga xos skriptlarni ishga tushirish
            this.initPageScripts(pageName);
            
            this.currentPage = pageName;
            
            // URL ni yangilash (agar kerak bo'lsa)
            this.updateURL(pageName);
            
            // Mobile menuni yopish
            this.closeMobileMenu();
            
        } catch (error) {
            console.error('Sahifani yuklashda xato:', error);
            showToast('Sahifani yuklashda xato yuz berdi', 'error');
        } finally {
            hideLoading();
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

    // Sahifaga xos skriptlarni ishga tushirish
    initPageScripts(pageName) {
        switch (pageName) {
            case 'dashboard':
                if (window.Dashboard) window.Dashboard.init();
                break;
            case 'users':
                if (window.Users) window.Users.init();
                break;
            case 'students':
                if (window.Students) window.Students.init();
                break;
            case 'academic':
                if (window.Academic) window.Academic.init();
                break;
            case 'schedule':
                if (window.Schedule) window.Schedule.init();
                break;
            case 'payments':
                if (window.Payments) window.Payments.init();
                break;
            case 'news':
                if (window.News) window.News.init();
                break;
            case 'reports':
                if (window.Reports) window.Reports.init();
                break;
        }
    }

    // URL ni yangilash
    updateURL(pageName) {
        const url = new URL(window.location);
        url.searchParams.set('page', pageName);
        window.history.replaceState(null, '', url);
    }

    // Window resize ni boshqarish
    handleResize() {
        const width = window.innerWidth;
        const sidebarContainer = document.getElementById('sidebar-container');
        const mobileNav = document.getElementById('mobile-nav');

        if (width >= 1024) {
            // Desktop
            if (sidebarContainer) {
                sidebarContainer.classList.remove('hidden');
            }
            this.closeMobileMenu();
        } else {
            // Mobile/Tablet
            if (sidebarContainer) {
                sidebarContainer.classList.add('hidden');
            }
        }
    }

    // Klaviatura shortcutlari
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K - Global qidiruv
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.openGlobalSearch();
        }

        // Escape - Modal yoki menuni yopish
        if (e.key === 'Escape') {
            this.closeMobileMenu();
            closeModal();
        }

        // Alt + raqamlar - sahifalar orasida o'tish
        if (e.altKey && !isNaN(e.key)) {
            e.preventDefault();
            const pages = ['dashboard', 'users', 'students', 'academic', 'schedule', 'payments', 'news', 'reports'];
            const pageIndex = parseInt(e.key) - 1;
            if (pages[pageIndex]) {
                this.loadPage(pages[pageIndex]);
            }
        }
    }

    // Global qidiruvni ochish
    openGlobalSearch() {
        // Bu yerda global qidiruv modal yoki sahifasini ochish
        showToast('Global qidiruv funksiyasi tez orada...', 'info');
    }

    // Breadcrumb yaratish
    createBreadcrumb(items) {
        const breadcrumbHTML = items.map((item, index) => {
            if (index === items.length - 1) {
                return `<span class="breadcrumb-current">${item.title}</span>`;
            } else {
                return `<a href="#" class="breadcrumb-link" data-page="${item.page}">${item.title}</a>`;
            }
        }).join('');

        return `<nav class="breadcrumb">${breadcrumbHTML}</nav>`;
    }

    // Jadval yaratish
    createTable(tableId, data, columns, actions = []) {
        const tableHTML = `
            <div class="bg-white shadow-sm rounded-lg border border-gray-200">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200" id="${tableId}">
                        <thead class="bg-gray-50">
                            <tr>
                                ${columns.map(col => `
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ${col.title}
                                    </th>
                                `).join('')}
                                ${actions.length > 0 ? '<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amallar</th>' : ''}
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${data.map(row => `
                                <tr class="hover:bg-gray-50">
                                    ${columns.map(col => `
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${this.formatCellValue(row[col.key], col.type)}
                                        </td>
                                    `).join('')}
                                    ${actions.length > 0 ? `
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div class="flex justify-end space-x-2">
                                                ${actions.map(action => `
                                                    <button class="action-btn action-btn-${action.type}" 
                                                            onclick="${action.onclick}('${row.id}')"
                                                            title="${action.title}">
                                                        ${action.icon}
                                                    </button>
                                                `).join('')}
                                            </div>
                                        </td>
                                    ` : ''}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        return tableHTML;
    }

    // Jadval hujayra qiymatini formatlash
    formatCellValue(value, type) {
        if (!value && value !== 0) return '-';

        switch (type) {
            case 'date':
                return formatDate(value);
            case 'shortDate':
                return formatShortDate(value);
            case 'time':
                return formatTime(value);
            case 'phone':
                return formatPhone(value);
            case 'role':
                return getRoleText(value);
            case 'day':
                return getDayText(value);
            case 'status':
                return `<span class="status-badge status-${value === true || value === 'present' || value === 'active' ? 'active' : 'inactive'}">${value}</span>`;
            case 'currency':
                return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS' }).format(value);
            default:
                return value;
        }
    }

    // Paginatsiya yaratish
    createPagination(currentPage, totalPages, onPageChange) {
        if (totalPages <= 1) return '';

        const pages = calculatePagination(currentPage, totalPages);
        
        const paginationHTML = `
            <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div class="flex-1 flex justify-between sm:hidden">
                    <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage <= 1 ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}" 
                            onclick="${currentPage > 1 ? `${onPageChange}(${currentPage - 1})` : ''}"
                            ${currentPage <= 1 ? 'disabled' : ''}>
                        Oldingi
                    </button>
                    <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage >= totalPages ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}"
                            onclick="${currentPage < totalPages ? `${onPageChange}(${currentPage + 1})` : ''}"
                            ${currentPage >= totalPages ? 'disabled' : ''}>
                        Keyingi
                    </button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            Sahifa <span class="font-medium">${currentPage}</span> / <span class="font-medium">${totalPages}</span>
                        </p>
                    </div>
                    <div>
                        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage <= 1 ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}"
                                    onclick="${currentPage > 1 ? `${onPageChange}(${currentPage - 1})` : ''}"
                                    ${currentPage <= 1 ? 'disabled' : ''}>
                                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                            </button>
                            
                            ${pages.map(page => {
                                if (page === '...') {
                                    return '<span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>';
                                } else {
                                    const isActive = page === currentPage;
                                    return `<button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${isActive ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                                                    onclick="${onPageChange}(${page})">${page}</button>`;
                                }
                            }).join('')}
                            
                            <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage >= totalPages ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}"
                                    onclick="${currentPage < totalPages ? `${onPageChange}(${currentPage + 1})` : ''}"
                                    ${currentPage >= totalPages ? 'disabled' : ''}>
                                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        `;

        return paginationHTML;
    }

    // Loading holatini ko'rsatish
    showTableLoading(tableContainer) {
        tableContainer.innerHTML = `
            <div class="table-loading">
                <div class="loading-spinner"></div>
                <p class="mt-2 text-sm text-gray-600">Yuklanmoqda...</p>
            </div>
        `;
    }

    // Bo'sh holat ko'rsatish
    showEmptyState(container, title = "Ma'lumot topilmadi", description = "Hozircha hech qanday ma'lumot mavjud emas.") {
        container.innerHTML = `
            <div class="empty-state">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 20v-4a4 4 0 118 0v4m0 0l-8 8m8-8l8 8"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">${title}</h3>
                <p class="mt-1 text-sm text-gray-500">${description}</p>
            </div>
        `;
    }
}

// Global ComponentManager obyektini yaratish
const componentManager = new ComponentManager();

// Global export
if (typeof window !== 'undefined') {
    window.ComponentManager = componentManager;
}