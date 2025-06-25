// Date and time helpers
export const formatDate = (date, locale = 'uz-UZ') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale);
};

export const formatDateTime = (date, locale = 'uz-UZ') => {
  if (!date) return '';
  return new Date(date).toLocaleString(locale);
};

export const formatTime = (time) => {
  if (!time) return '';
  return time.slice(0, 5); // HH:MM format
};

export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffInHours = Math.abs(now - targetDate) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Hozir';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} soat oldin`;
  } else if (diffInHours < 168) { // 1 week
    return `${Math.floor(diffInHours / 24)} kun oldin`;
  } else {
    return formatDate(date);
  }
};

// String helpers
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => capitalizeFirst(word)).join(' ');
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Number helpers
export const formatCurrency = (amount, currency = 'so\'m') => {
  if (amount === null || amount === undefined) return '0 ' + currency;
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' ' + currency;
};

export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return (value * 100).toFixed(decimals) + '%';
};

export const parseNumber = (str) => {
  if (!str) return 0;
  return parseFloat(str.toString().replace(/[^\d.-]/g, '')) || 0;
};

// Phone number helpers
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.toString().replace(/\D/g, '');
  
  // If starts with 998, format as +998 XX XXX XX XX
  if (digits.startsWith('998') && digits.length === 12) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  
  // If 9 digits, assume it's Uzbek number without country code
  if (digits.length === 9) {
    return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
  }
  
  return phone;
};

export const validateUzbekPhone = (phone) => {
  if (!phone) return false;
  const digits = phone.toString().replace(/\D/g, '');
  
  // Must be 9 digits for local number or 12 digits with country code
  if (digits.length === 9) {
    // Should start with 9 (90, 91, 93, 94, 95, 97, 98, 99)
    return /^9[0-9]/.test(digits);
  }
  
  if (digits.length === 12) {
    // Should start with 9989
    return digits.startsWith('9989');
  }
  
  return false;
};

// Array helpers
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });
};

export const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// File helpers
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  return imageExtensions.includes(getFileExtension(filename).toLowerCase());
};

export const isDocumentFile = (filename) => {
  const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  return docExtensions.includes(getFileExtension(filename).toLowerCase());
};

// URL helpers
export const buildUrl = (base, params = {}) => {
  const url = new URL(base);
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

// Color helpers
export const getRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getStatusColor = (status) => {
  const colors = {
    active: '#10B981',
    inactive: '#EF4444',
    pending: '#F59E0B',
    completed: '#059669',
    cancelled: '#DC2626',
    draft: '#6B7280'
  };
  return colors[status] || '#6B7280';
};

// Local storage helpers
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Debounce helper
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Deep clone helper
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Generate random ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Academic year helpers
export const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 0-based to 1-based
  
  // Academic year starts in September (month 9)
  if (month >= 9) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

export const getAcademicYears = (count = 5) => {
  const current = getCurrentAcademicYear();
  const currentYear = parseInt(current.split('-')[0]);
  const years = [];
  
  for (let i = -2; i < count - 2; i++) {
    const year = currentYear + i;
    years.push(`${year}-${year + 1}`);
  }
  
  return years;
};

// Grade calculation helpers
export const calculateGrade = (points, maxPoints) => {
  if (!points || !maxPoints) return 0;
  return Math.round((points / maxPoints) * 100);
};

export const getGradeLetter = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

export const getGradeColor = (percentage) => {
  if (percentage >= 90) return '#10B981'; // Green
  if (percentage >= 80) return '#059669'; // Dark green
  if (percentage >= 70) return '#F59E0B'; // Yellow
  if (percentage >= 60) return '#EF4444'; // Red
  return '#DC2626'; // Dark red
};