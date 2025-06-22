// Yordamchi funksiyalar

// Toast bildirishnomalarni ko'rsatish
function showToast(message, type = 'info', duration = 5000) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const toastId = 'toast-' + Date.now();
    toast.id = toastId;
    
    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-title">${getToastTitle(type)}</span>
            <button class="toast-close" onclick="removeToast('${toastId}')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animatsiya bilan ko'rsatish
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Avtomatik o'chirish
    setTimeout(() => removeToast(toastId), duration);
}

function getToastTitle(type) {
    const titles = {
        success: 'Muvaffaqiyat',
        error: 'Xato',
        warning: 'Ogohlantirish',
        info: 'Ma\'lumot'
    };
    return titles[type] || 'Bildirishnoma';
}

function removeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }
}

// Loading holatini ko'rsatish/yashirish
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('hidden');
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}

// Modalni ochish/yopish
function openModal(templateId, data = {}) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const template = document.getElementById(templateId);
    
    if (!template) {
        console.error('Modal template topilmadi:', templateId);
        return;
    }
    
    // Template ni ko'chirish
    modalContent.innerHTML = template.innerHTML;
    
    // Modalga ma'lumotlarni to'ldirish
    fillModalData(modalContent, data);
    
    // Modalni ko'rsatish
    modalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Yopish tugmalari uchun event listenerlar
    const closeButtons = modalContent.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Overlay bosilganda yopish
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

function closeModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function fillModalData(modal, data) {
    Object.keys(data).forEach(key => {
        const element = modal.querySelector(`[name="${key}"], #${key}`);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = data[key];
            } else {
                element.value = data[key];
            }
        }
    });
}

// Tasdiqlash modali
function showConfirmModal(title, message, onConfirm) {
    openModal('confirm-modal-template');
    
    const modalTitle = document.getElementById('confirm-modal-title');
    const modalMessage = document.getElementById('confirm-modal-message');
    const confirmButton = document.getElementById('confirm-modal-action');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalMessage) modalMessage.textContent = message;
    
    if (confirmButton) {
        confirmButton.onclick = () => {
            onConfirm();
            closeModal();
        };
    }
}

// Forma ma'lumotlarini olish
function getFormData(formElement) {
    const formData = new FormData(formElement);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

// Formani tozalash
function clearForm(formElement) {
    const inputs = formElement.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
}

// Formaga ma'lumotlarni to'ldirish
function fillForm(formElement, data) {
    Object.keys(data).forEach(key => {
        const element = formElement.querySelector(`[name="${key}"]`);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = data[key];
            } else if (element.type === 'radio') {
                if (element.value === data[key]) {
                    element.checked = true;
                }
            } else {
                element.value = data[key];
            }
        }
    });
}

// Sanani formatlash
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('uz-UZ', options);
}

// Qisqa sana formati
function formatShortDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ');
}

// Vaqtni formatlash
function formatTime(timeString) {
    if (!timeString) return '';
    
    return timeString.slice(0, 5); // HH:MM formatda
}

// Telefon raqamini formatlash
function formatPhone(phone) {
    if (!phone) return '';
    
    const phoneStr = phone.toString();
    if (phoneStr.startsWith('998')) {
        return `+${phoneStr}`;
    } else if (phoneStr.length === 9) {
        return `+998${phoneStr}`;
    }
    
    return phoneStr;
}

// Rolni o'zbek tiliga o'girish
function getRoleText(role) {
    const roles = {
        admin: 'Administrator',
        teacher: 'O\'qituvchi',
        student: 'O\'quvchi',
        parent: 'Ota-ona'
    };
    return roles[role] || role;
}

// Hafta kunini o'zbek tiliga o'girish
function getDayText(day) {
    const days = {
        monday: 'Dushanba',
        tuesday: 'Seshanba',
        wednesday: 'Chorshanba',
        thursday: 'Payshanba',
        friday: 'Juma',
        saturday: 'Shanba',
        sunday: 'Yakshanba'
    };
    return days[day] || day;
}

// To'lov holatini formatlash
function getPaymentStatusText(isFullyPaid) {
    return isFullyPaid ? 'To\'langan' : 'To\'lanmagan';
}

// Davomat holatini formatlash
function getAttendanceStatusText(status) {
    const statuses = {
        present: 'Mavjud',
        absent: 'Mavjud emas',
        late: 'Kech kelgan'
    };
    return statuses[status] || status;
}

// Paginatsiya uchun sahifa raqamlarini hisoblash
function calculatePagination(currentPage, totalPages, maxVisible = 5) {
    const pages = [];
    
    if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        
        if (start > 1) {
            pages.unshift('...');
            pages.unshift(1);
        }
        
        if (end < totalPages) {
            pages.push('...');
            pages.push(totalPages);
        }
    }
    
    return pages;
}

// Local Storage uchun yordamchi funksiyalar
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('LocalStorage xatosi:', error);
    }
}

function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('LocalStorage o\'qish xatosi:', error);
        return defaultValue;
    }
}

function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('LocalStorage o\'chirish xatosi:', error);
    }
}

// Debounce funksiyasi (qidiruv uchun)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Loading holatini tugma uchun
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Yuklanmoqda...
        `;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || button.innerHTML;
    }
}

// Xatolarni ko'rsatish
function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    // Avvalgi xato xabarini o'chirish
    const existingError = field.parentNode.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Yangi xato xabarini qo'shish
    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldErrors() {
    const errorFields = document.querySelectorAll('.form-input.error');
    const errorMessages = document.querySelectorAll('.form-error');
    
    errorFields.forEach(field => field.classList.remove('error'));
    errorMessages.forEach(message => message.remove());
}

// URL parametrlarini olish
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (let [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// Avtomatik avatar yaratish
function generateAvatar(name) {
    if (!name) return '';
    
    const initials = name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const bgColor = colors[name.length % colors.length];
    
    const svg = `
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" fill="${bgColor}" rx="20"/>
            <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="500">${initials}</text>
        </svg>
    `;
    
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showToast('Noma\'lum xato yuz berdi', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showToast('So\'rov bajarilmadi', 'error');
});

// Export qilish (agar kerak bo'lsa)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        formatDate,
        formatTime,
        formatPhone,
        getRoleText,
        getDayText
    };
}