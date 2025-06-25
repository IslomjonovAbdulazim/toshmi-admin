// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Admin Navigation Menu
export const MENU_ITEMS = [
  {
    path: '/',
    label: 'Bosh sahifa',
    icon: '🏠'
  },
  {
    path: '/students',
    label: 'O\'quvchilar',
    icon: '👨‍🎓'
  },
  {
    path: '/teachers',
    label: 'O\'qituvchilar',
    icon: '👩‍🏫'
  },
  {
    path: '/parents',
    label: 'Ota-onalar',
    icon: '👨‍👩‍👧‍👦'
  },
  {
    path: '/groups',
    label: 'Sinflar',
    icon: '🏫'
  },
  {
    path: '/subjects',
    label: 'Fanlar',
    icon: '📚'
  },
  {
    path: '/assignments',
    label: 'O\'qituvchi tayinlash',
    icon: '📋'
  },
  {
    path: '/schedule',
    label: 'Dars jadvali',
    icon: '📅'
  },
  {
    path: '/payments',
    label: 'To\'lovlar',
    icon: '💰'
  },
  {
    path: '/news',
    label: 'Yangiliklar',
    icon: '📰'
  }
];

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent'
};

// Role Labels in Uzbek
export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.TEACHER]: 'O\'qituvchi',
  [USER_ROLES.STUDENT]: 'O\'quvchi',
  [USER_ROLES.PARENT]: 'Ota-ona'
};

// Days of the week for schedule
export const WEEKDAYS = [
  { value: 0, label: 'Dushanba' },
  { value: 1, label: 'Seshanba' },
  { value: 2, label: 'Chorshanba' },
  { value: 3, label: 'Payshanba' },
  { value: 4, label: 'Juma' },
  { value: 5, label: 'Shanba' },
  { value: 6, label: 'Yakshanba' }
];

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer'
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Naqd pul',
  [PAYMENT_METHODS.CARD]: 'Plastik karta',
  [PAYMENT_METHODS.TRANSFER]: 'Bank o\'tkazmasi'
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
};

export const ATTENDANCE_STATUS_LABELS = {
  [ATTENDANCE_STATUS.PRESENT]: 'Kelgan',
  [ATTENDANCE_STATUS.ABSENT]: 'Kelmagan',
  [ATTENDANCE_STATUS.LATE]: 'Kech kelgan',
  [ATTENDANCE_STATUS.EXCUSED]: 'Sababli'
};

// Academic Years
export const ACADEMIC_YEARS = [
  '2022-2023',
  '2023-2024',
  '2024-2025',
  '2025-2026',
  '2026-2027'
];

// Common Subjects for quick adding
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
  'Texnologiya'
];

// Grade Levels
export const GRADE_LEVELS = [
  { value: 1, label: '1-sinf' },
  { value: 2, label: '2-sinf' },
  { value: 3, label: '3-sinf' },
  { value: 4, label: '4-sinf' },
  { value: 5, label: '5-sinf' },
  { value: 6, label: '6-sinf' },
  { value: 7, label: '7-sinf' },
  { value: 8, label: '8-sinf' },
  { value: 9, label: '9-sinf' },
  { value: 10, label: '10-sinf' },
  { value: 11, label: '11-sinf' }
];

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    ARCHIVE: ['application/zip', 'application/x-rar-compressed']
  }
};

// Pagination Settings
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// Uzbek Months
export const UZBEK_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

// Time slots for schedule
export const TIME_SLOTS = [
  '08:00', '08:45', '09:30', '10:15', '11:00', '11:45',
  '12:30', '13:15', '14:00', '14:45', '15:30', '16:15'
];

// Success/Error Messages
export const MESSAGES = {
  SUCCESS: {
    CREATED: 'Muvaffaqiyatli yaratildi',
    UPDATED: 'Muvaffaqiyatli yangilandi',
    DELETED: 'Muvaffaqiyatli o\'chirildi',
    UPLOADED: 'Fayl muvaffaqiyatli yuklandi',
    SAVED: 'Ma\'lumotlar saqlandi'
  },
  ERROR: {
    GENERAL: 'Xatolik yuz berdi',
    NETWORK: 'Tarmoq xatoligi',
    UNAUTHORIZED: 'Ruxsat berilmagan',
    NOT_FOUND: 'Topilmadi',
    VALIDATION: 'Ma\'lumotlar noto\'g\'ri',
    FILE_SIZE: 'Fayl hajmi juda katta',
    FILE_TYPE: 'Fayl turi qo\'llab-quvvatlanmaydi'
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Date Format
export const DATE_FORMAT = 'DD.MM.YYYY';
export const DATETIME_FORMAT = 'DD.MM.YYYY HH:mm';

// Application Settings
export const APP_CONFIG = {
  NAME: 'Maktab Boshqaruv Tizimi',
  VERSION: '2.0.0',
  AUTHOR: 'School Management Team',
  DEFAULT_LANGUAGE: 'uz',
  REFRESH_INTERVAL: 30000, // 30 seconds
  SESSION_TIMEOUT: 3600000 // 1 hour
};