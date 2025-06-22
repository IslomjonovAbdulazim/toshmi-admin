// src/utils/helpers.js
export const formatPhone = (phone) => {
  if (!phone) return '';
  const phoneStr = phone.toString();
  return phoneStr.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '+998 $1 $2 $3 $4');
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 so\'m';
  return `${amount.toLocaleString('uz-UZ')} so'm`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  return imageExtensions.includes(getFileExtension(filename));
};

export const getRoleName = (role) => {
  const roleNames = {
    admin: 'Administrator',
    teacher: 'O\'qituvchi',
    student: 'O\'quvchi',
    parent: 'Ota-ona'
  };
  return roleNames[role] || role;
};

export const getAttendanceStatus = (status) => {
  const statusNames = {
    present: 'Keldi',
    absent: 'Kelmadi',
    late: 'Kech keldi'
  };
  return statusNames[status] || status;
};

export const generatePassword = (length = 8) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

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

export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};