// Validation rules and messages
export const VALIDATION_RULES = {
  REQUIRED: 'Bu maydon to\'ldirilishi shart',
  EMAIL: 'Email formati noto\'g\'ri',
  PHONE: 'Telefon raqam formati noto\'g\'ri',
  MIN_LENGTH: 'Minimum uzunlik:',
  MAX_LENGTH: 'Maksimal uzunlik:',
  NUMERIC: 'Faqat raqam kiriting',
  POSITIVE: 'Musbat qiymat kiriting',
  PASSWORD_WEAK: 'Parol juda oddiy (minimum 6 belgi)',
  DATE_INVALID: 'Noto\'g\'ri sana formati',
  URL_INVALID: 'Noto\'g\'ri URL formati'
};

// Basic validation functions
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined && value !== '';
};

export const isEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isPhoneNumber = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digits
  const digits = phone.toString().replace(/\D/g, '');
  
  // Check for Uzbek phone numbers
  // 9 digits: local format (90xxxxxxx)
  // 12 digits: international format (998xxxxxxxxx)
  if (digits.length === 9) {
    return /^9[0-9]/.test(digits); // Should start with 9
  }
  
  if (digits.length === 12) {
    return digits.startsWith('9989'); // Should start with 9989
  }
  
  return false;
};

export const isNumeric = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

export const isPositive = (value) => {
  return isNumeric(value) && parseFloat(value) > 0;
};

export const isInteger = (value) => {
  return Number.isInteger(Number(value));
};

export const isUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

export const isValidDateString = (dateString) => {
  const date = new Date(dateString);
  return isDate(date);
};

// Length validation
export const hasMinLength = (value, minLength) => {
  if (!value) return false;
  return value.toString().length >= minLength;
};

export const hasMaxLength = (value, maxLength) => {
  if (!value) return true;
  return value.toString().length <= maxLength;
};

export const hasLengthBetween = (value, minLength, maxLength) => {
  return hasMinLength(value, minLength) && hasMaxLength(value, maxLength);
};

// Password validation
export const isStrongPassword = (password) => {
  if (!password || password.length < 6) return false;
  
  // At least one number, one lowercase and one uppercase letter
  const hasNumber = /\d/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  
  return hasNumber && hasLower && hasUpper;
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Parol kiritilishi shart');
    return errors;
  }
  
  if (password.length < 6) {
    errors.push('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
  }
  
  if (password.length > 50) {
    errors.push('Parol 50 ta belgidan ko\'p bo\'lmasligi kerak');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Parolda kamida bitta raqam bo\'lishi kerak');
  }
  
  return errors;
};

// Custom validation functions
export const validateName = (name) => {
  const errors = [];
  
  if (!isRequired(name)) {
    errors.push('Ism kiritilishi shart');
    return errors;
  }
  
  if (!hasMinLength(name, 2)) {
    errors.push('Ism kamida 2 ta belgidan iborat bo\'lishi kerak');
  }
  
  if (!hasMaxLength(name, 50)) {
    errors.push('Ism 50 ta belgidan ko\'p bo\'lmasligi kerak');
  }
  
  // Only letters, spaces, and some special characters
  if (!/^[a-zA-ZА-Яа-яЁёўқғҳ\s\-\']+$/u.test(name)) {
    errors.push('Ismda faqat harflar, probel va defis bo\'lishi mumkin');
  }
  
  return errors;
};

export const validatePhone = (phone) => {
  const errors = [];
  
  if (!isRequired(phone)) {
    errors.push('Telefon raqam kiritilishi shart');
    return errors;
  }
  
  if (!isPhoneNumber(phone)) {
    errors.push('Telefon raqam formati noto\'g\'ri (masalan: 901234567)');
  }
  
  return errors;
};

export const validateEmail = (email) => {
  const errors = [];
  
  if (email && !isEmail(email)) {
    errors.push('Email formati noto\'g\'ri');
  }
  
  return errors;
};

export const validateAmount = (amount) => {
  const errors = [];
  
  if (!isRequired(amount)) {
    errors.push('Miqdor kiritilishi shart');
    return errors;
  }
  
  if (!isNumeric(amount)) {
    errors.push('Miqdor raqam bo\'lishi kerak');
    return errors;
  }
  
  if (!isPositive(amount)) {
    errors.push('Miqdor musbat bo\'lishi kerak');
  }
  
  return errors;
};

export const validateYear = (year) => {
  const errors = [];
  
  if (!isRequired(year)) {
    errors.push('Yil kiritilishi shart');
    return errors;
  }
  
  if (!isInteger(year)) {
    errors.push('Yil butun son bo\'lishi kerak');
    return errors;
  }
  
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear + 10) {
    errors.push(`Yil ${1900} va ${currentYear + 10} orasida bo\'lishi kerak`);
  }
  
  return errors;
};

// Form validation helpers
export class FormValidator {
  constructor() {
    this.rules = {};
    this.errors = {};
  }
  
  // Add validation rule
  addRule(field, validator, message) {
    if (!this.rules[field]) {
      this.rules[field] = [];
    }
    this.rules[field].push({ validator, message });
    return this;
  }
  
  // Add required field rule
  required(field, message = VALIDATION_RULES.REQUIRED) {
    return this.addRule(field, isRequired, message);
  }
  
  // Add email rule
  email(field, message = VALIDATION_RULES.EMAIL) {
    return this.addRule(field, isEmail, message);
  }
  
  // Add phone rule
  phone(field, message = VALIDATION_RULES.PHONE) {
    return this.addRule(field, isPhoneNumber, message);
  }
  
  // Add minimum length rule
  minLength(field, length, message) {
    const msg = message || `${VALIDATION_RULES.MIN_LENGTH} ${length}`;
    return this.addRule(field, (value) => hasMinLength(value, length), msg);
  }
  
  // Add maximum length rule
  maxLength(field, length, message) {
    const msg = message || `${VALIDATION_RULES.MAX_LENGTH} ${length}`;
    return this.addRule(field, (value) => hasMaxLength(value, length), msg);
  }
  
  // Add numeric rule
  numeric(field, message = VALIDATION_RULES.NUMERIC) {
    return this.addRule(field, isNumeric, message);
  }
  
  // Add positive number rule
  positive(field, message = VALIDATION_RULES.POSITIVE) {
    return this.addRule(field, isPositive, message);
  }
  
  // Add custom rule
  custom(field, validator, message) {
    return this.addRule(field, validator, message);
  }
  
  // Validate form data
  validate(data) {
    this.errors = {};
    let isValid = true;
    
    Object.keys(this.rules).forEach(field => {
      const fieldRules = this.rules[field];
      const value = data[field];
      
      for (const rule of fieldRules) {
        if (!rule.validator(value)) {
          if (!this.errors[field]) {
            this.errors[field] = [];
          }
          this.errors[field].push(rule.message);
          isValid = false;
          break; // Stop at first error for this field
        }
      }
    });
    
    return {
      isValid,
      errors: this.errors
    };
  }
  
  // Get errors for specific field
  getFieldErrors(field) {
    return this.errors[field] || [];
  }
  
  // Get first error for specific field
  getFieldError(field) {
    const errors = this.getFieldErrors(field);
    return errors.length > 0 ? errors[0] : '';
  }
  
  // Check if field has errors
  hasFieldError(field) {
    return this.getFieldErrors(field).length > 0;
  }
  
  // Get all errors as flat array
  getAllErrors() {
    const allErrors = [];
    Object.values(this.errors).forEach(fieldErrors => {
      allErrors.push(...fieldErrors);
    });
    return allErrors;
  }
  
  // Clear all errors
  clearErrors() {
    this.errors = {};
  }
  
  // Clear errors for specific field
  clearFieldErrors(field) {
    delete this.errors[field];
  }
}

// Pre-defined validators for common forms
export const createUserValidator = () => {
  return new FormValidator()
    .required('first_name')
    .minLength('first_name', 2)
    .maxLength('first_name', 50)
    .required('last_name')
    .minLength('last_name', 2)
    .maxLength('last_name', 50)
    .required('phone')
    .phone('phone')
    .email('email');
};

export const createStudentValidator = () => {
  return createUserValidator()
    .required('group_id', 'Sinf tanlanishi shart')
    .numeric('graduation_year')
    .positive('graduation_year')
    .phone('parent_phone');
};

export const createTeacherValidator = () => {
  return createUserValidator()
    .maxLength('specialization', 100);
};

export const createParentValidator = () => {
  return createUserValidator();
};

export const createPaymentValidator = () => {
  return new FormValidator()
    .required('student_id', 'O\'quvchi tanlanishi shart')
    .required('amount')
    .numeric('amount')
    .positive('amount')
    .required('payment_method', 'To\'lov usuli tanlanishi shart');
};

export const createNewsValidator = () => {
  return new FormValidator()
    .required('title')
    .minLength('title', 5)
    .maxLength('title', 200)
    .required('content')
    .minLength('content', 10)
    .maxLength('content', 5000);
};

// Export default validator instance
export default FormValidator;