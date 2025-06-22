// src/utils/validators.js
export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} majburiy maydon`;
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return 'Telefon raqam majburiy';
  
  const phoneRegex = /^[0-9]{9,12}$/;
  const cleanPhone = phone.toString().replace(/[^\d]/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    return 'Telefon raqam noto\'g\'ri formatda';
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email) return null; // Email is optional in most cases
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email noto\'g\'ri formatda';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Parol majburiy';
  
  if (password.length < 6) {
    return 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak';
  }
  return null;
};

export const validateNumber = (value, fieldName, min = null, max = null) => {
  if (!value && value !== 0) return `${fieldName} majburiy`;
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} raqam bo'lishi kerak`;
  }
  
  if (min !== null && num < min) {
    return `${fieldName} ${min} dan kichik bo'lmasligi kerak`;
  }
  
  if (max !== null && num > max) {
    return `${fieldName} ${max} dan katta bo'lmasligi kerak`;
  }
  
  return null;
};

export const validateYear = (year) => {
  const currentYear = new Date().getFullYear();
  return validateNumber(year, 'Yil', currentYear - 10, currentYear + 20);
};

export const validateGraduationYear = (year) => {
  const currentYear = new Date().getFullYear();
  return validateNumber(year, 'Bitirish yili', currentYear, currentYear + 15);
};

export const validateFileSize = (file, maxSizeMB = 5) => {
  if (!file) return null;
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Fayl hajmi ${maxSizeMB}MB dan oshmasligi kerak`;
  }
  return null;
};

export const validateFileType = (file, allowedTypes = ['image/*']) => {
  if (!file) return null;
  
  const isAllowed = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.replace('/*', '/'));
    }
    return file.type === type;
  });
  
  if (!isAllowed) {
    return `Fayl turi qo'llab-quvvatlanmaydi. Ruxsat berilgan: ${allowedTypes.join(', ')}`;
  }
  return null;
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required) {
      const error = validateRequired(value, rule.label || field);
      if (error) {
        errors[field] = error;
        return;
      }
    }
    
    if (rule.type === 'phone') {
      const error = validatePhone(value);
      if (error) errors[field] = error;
    }
    
    if (rule.type === 'email') {
      const error = validateEmail(value);
      if (error) errors[field] = error;
    }
    
    if (rule.type === 'password') {
      const error = validatePassword(value);
      if (error) errors[field] = error;
    }
    
    if (rule.type === 'number') {
      const error = validateNumber(value, rule.label || field, rule.min, rule.max);
      if (error) errors[field] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};