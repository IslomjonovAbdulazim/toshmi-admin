// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://islomjonovabdulazim-toshmi-backend-0914.twc1.net';

// App Configuration
export const APP_NAME = process.env.REACT_APP_NAME || 'School Management Admin';
export const APP_VERSION = process.env.REACT_APP_VERSION || '2.0.0';

// Navigation Menu Items (Removed notifications and assignments)
export const MENU_ITEMS = [
  {
    key: 'dashboard',
    path: '/',
    icon: '📊',
    label: 'Dashboard',
    exact: true
  },
  {
    key: 'students',
    path: '/students',
    icon: '👨‍🎓',
    label: 'O\'quvchilar'
  },
  {
    key: 'teachers',
    path: '/teachers',
    icon: '👩‍🏫',
    label: 'O\'qituvchilar'
  },
  {
    key: 'parents',
    path: '/parents',
    icon: '👨‍👩‍👧‍👦',
    label: 'Ota-onalar'
  },
  {
    key: 'groups',
    path: '/groups',
    icon: '👥',
    label: 'Guruhlar'
  },
  {
    key: 'subjects',
    path: '/subjects',
    icon: '📚',
    label: 'Fanlar'
  },
  {
    key: 'schedule',
    path: '/schedule',
    icon: '📅',
    label: 'Dars jadvali'
  },
  {
    key: 'payments',
    path: '/payments',
    icon: '💰',
    label: 'To\'lovlar'
  },
  {
    key: 'news',
    path: '/news',
    icon: '📰',
    label: 'Yangiliklar'
  }
];

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent'
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.TEACHER]: 'O\'qituvchi',
  [USER_ROLES.STUDENT]: 'O\'quvchi',
  [USER_ROLES.PARENT]: 'Ota-ona'
};

// User Status
export const USER_STATUS = {
  ACTIVE: true,
  INACTIVE: false
};

export const STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'Faol',
  [USER_STATUS.INACTIVE]: 'Nofaol'
};

// Week Days
export const WEEKDAYS = [
  { value: 1, label: 'Dushanba' },
  { value: 2, label: 'Seshanba' },
  { value: 3, label: 'Chorshanba' },
  { value: 4, label: 'Payshanba' },
  { value: 5, label: 'Juma' },
  { value: 6, label: 'Shanba' },
  { value: 7, label: 'Yakshanba' }
];

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
};

export const ATTENDANCE_STATUS_LABELS = {
  [ATTENDANCE_STATUS.PRESENT]: 'Keldi',
  [ATTENDANCE_STATUS.ABSENT]: 'Kelmadi',
  [ATTENDANCE_STATUS.LATE]: 'Kech keldi',
  [ATTENDANCE_STATUS.EXCUSED]: 'Sababli'
};

export const ATTENDANCE_STATUS_COLORS = {
  [ATTENDANCE_STATUS.PRESENT]: 'success',
  [ATTENDANCE_STATUS.ABSENT]: 'danger',
  [ATTENDANCE_STATUS.LATE]: 'warning',
  [ATTENDANCE_STATUS.EXCUSED]: 'info'
};

// Payment Status
export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  PARTIAL: 'partial'
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PAID]: 'To\'landi',
  [PAYMENT_STATUS.PENDING]: 'Kutilmoqda',
  [PAYMENT_STATUS.OVERDUE]: 'Muddati o\'tgan',
  [PAYMENT_STATUS.PARTIAL]: 'Qisman to\'landi'
};

export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PAID]: 'success',
  [PAYMENT_STATUS.PENDING]: 'warning',
  [PAYMENT_STATUS.OVERDUE]: 'danger',
  [PAYMENT_STATUS.PARTIAL]: 'info'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  ONLINE: 'online'
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Naqd',
  [PAYMENT_METHODS.CARD]: 'Plastik karta',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank o\'tkazmasi',
  [PAYMENT_METHODS.ONLINE]: 'Onlayn to\'lov'
};

// Grade System
export const GRADE_SYSTEM = {
  MIN_GRADE: 0,
  MAX_GRADE: 100,
  PASSING_GRADE: 60
};

export const GRADE_LETTERS = {
  A: { min: 90, max: 100, label: 'A (A\'lo)' },
  B: { min: 80, max: 89, label: 'B (Yaxshi)' },
  C: { min: 70, max: 79, label: 'C (Qoniqarli)' },
  D: { min: 60, max: 69, label: 'D (O\'rtacha)' },
  F: { min: 0, max: 59, label: 'F (Qoniqarsiz)' }
};

export const GRADE_COLORS = {
  A: 'success',
  B: 'info',
  C: 'warning',
  D: 'secondary',
  F: 'danger'
};

// Academic Years
export const CURRENT_ACADEMIC_YEAR = '2024-2025';
export const ACADEMIC_YEARS = [
  '2024-2025',
  '2023-2024',
  '2022-2023',
  '2021-2022'
];

// Time Slots for Schedule
export const TIME_SLOTS = [
  { value: '08:00', label: '08:00' },
  { value: '08:30', label: '08:30' },
  { value: '09:00', label: '09:00' },
  { value: '09:30', label: '09:30' },
  { value: '10:00', label: '10:00' },
  { value: '10:30', label: '10:30' },
  { value: '11:00', label: '11:00' },
  { value: '11:30', label: '11:30' },
  { value: '12:00', label: '12:00' },
  { value: '12:30', label: '12:30' },
  { value: '13:00', label: '13:00' },
  { value: '13:30', label: '13:30' },
  { value: '14:00', label: '14:00' },
  { value: '14:30', label: '14:30' },
  { value: '15:00', label: '15:00' },
  { value: '15:30', label: '15:30' },
  { value: '16:00', label: '16:00' },
  { value: '16:30', label: '16:30' },
  { value: '17:00', label: '17:00' },
  { value: '17:30', label: '17:30' },
  { value: '18:00', label: '18:00' }
];

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ARCHIVE: ['application/zip', 'application/rar']
  }
};

// Messages
export const MESSAGES = {
  SUCCESS: {
    CREATED: 'Ma\'lumot muvaffaqiyatli yaratildi',
    UPDATED: 'Ma\'lumot muvaffaqiyatli yangilandi',
    DELETED: 'Ma\'lumot muvaffaqiyatli o\'chirildi',
    SAVED: 'Ma\'lumot muvaffaqiyatli saqlandi',
    LOGIN: 'Tizimga muvaffaqiyatli kirdingiz',
    LOGOUT: 'Tizimdan muvaffaqiyatli chiqdingiz',
    PASSWORD_CHANGED: 'Parol muvaffaqiyatli o\'zgartirildi',
    FILE_UPLOADED: 'Fayl muvaffaqiyatli yuklandi',
    EMAIL_SENT: 'Email muvaffaqiyatli yuborildi'
  },
  ERROR: {
    GENERIC: 'Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring',
    NETWORK: 'Tarmoq xatosi. Internet aloqangizni tekshiring',
    AUTH_FAILED: 'Login yoki parol noto\'g\'ri',
    ACCESS_DENIED: 'Ruxsat berilmagan',
    NOT_FOUND: 'Ma\'lumot topilmadi',
    VALIDATION: 'Ma\'lumotlarni to\'g\'ri kiriting',
    FILE_TOO_LARGE: 'Fayl hajmi juda katta',
    FILE_TYPE_INVALID: 'Fayl turi noto\'g\'ri',
    REQUIRED_FIELD: 'Bu maydon to\'ldirilishi shart',
    PHONE_INVALID: 'Telefon raqami noto\'g\'ri formatda',
    EMAIL_INVALID: 'Email manzili noto\'g\'ri formatda',
    PASSWORD_WEAK: 'Parol juda oddiy. Kamida 6 ta belgi bo\'lishi kerak'
  },
  CONFIRM: {
    DELETE: 'Rostdan ham o\'chirmoqchimisiz?',
    LOGOUT: 'Tizimdan chiqmoqchimisiz?',
    CANCEL: 'Bekor qilmoqchimisiz?',
    SAVE_CHANGES: 'O\'zgarishlarni saqlashni xohlaysizmi?'
  },
  LOADING: {
    DEFAULT: 'Yuklanmoqda...',
    SAVING: 'Saqlanmoqda...',
    DELETING: 'O\'chirilmoqda...',
    UPLOADING: 'Yuklanmoqda...',
    PROCESSING: 'Ishlov berilmoqda...'
  }
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_VISIBLE_PAGES: 5
};

// Table Configuration
export const TABLE_CONFIG = {
  EMPTY_MESSAGE: 'Ma\'lumot topilmadi',
  LOADING_MESSAGE: 'Ma\'lumotlar yuklanmoqda...',
  ERROR_MESSAGE: 'Ma\'lumotlarni yuklashda xatolik yuz berdi'
};

// Form Validation Rules
export const VALIDATION_RULES = {
  PHONE: {
    PATTERN: /^(\+998|998|8)?[0-9]{9}$/,
    MESSAGE: 'Telefon raqami noto\'g\'ri formatda. Masalan: +998901234567'
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Email manzili noto\'g\'ri formatda'
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MESSAGE: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    MESSAGE: 'Ism 2-50 ta belgi orasida bo\'lishi kerak'
  }
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD.MM.YYYY',
  DISPLAY_WITH_TIME: 'DD.MM.YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'school_admin_token',
  USER_DATA: 'school_admin_user',
  SIDEBAR_COLLAPSED: 'school_admin_sidebar_collapsed',
  THEME: 'school_admin_theme',
  LANGUAGE: 'school_admin_language'
};

// Theme Configuration
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Currency
export const CURRENCY = {
  SYMBOL: 'so\'m',
  CODE: 'UZS',
  DECIMAL_PLACES: 0
};

// Common Subjects for Quick Adding
export const COMMON_SUBJECTS = [
  'Matematika',
  'Fizika', 
  'Kimyo',
  'Biologiya',
  'Ona tili',
  'Adabiyot',
  'Ingliz tili',
  'Rus tili',
  'Tarix',
  'Geografiya',
  'Informatika',
  'Jismoniy tarbiya',
  'Tasviriy san\'at',
  'Musiqa',
  'Texnologiya',
  'Iqtisod',
  'Huquq',
  'Falsafa',
  'Psixologiya'
];

// Uzbek Months
export const UZBEK_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  ADMIN: {
    STUDENTS: '/admin/students',
    TEACHERS: '/admin/teachers',
    PARENTS: '/admin/parents',
    GROUPS: '/admin/groups',
    SUBJECTS: '/admin/subjects',
    SCHEDULE: '/admin/schedule',
    PAYMENTS: '/admin/payments',
    NEWS: '/admin/news',
    ASSIGN_TEACHER: '/admin/assign-teacher'
  },
  FILES: {
    UPLOAD: '/files',
    PROFILE_PICTURE: '/files/profile-picture'
  },
  SYSTEM: {
    HEALTH: '/health',
    STATS: '/stats'
  }
};

// Grade Calculation Helpers
export const getGradeLetter = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

export const getGradeColor = (percentage) => {
  const letter = getGradeLetter(percentage);
  return GRADE_COLORS[letter];
};

export const calculateGradePercentage = (points, maxPoints) => {
  if (!maxPoints || maxPoints === 0) return 0;
  return Math.round((points / maxPoints) * 100);
};