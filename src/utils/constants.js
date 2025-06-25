// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Admin Navigation Menu (Removed notifications and assignments)
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
  },
  {
    path: '/profile',
    label: 'Profil',
    icon: '👤'
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
    VALIDATION: 'Ma\'lumotlar noto\'g\'ri'
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Date Format
export const DATE_FORMAT = 'DD.MM.YYYY';
export const DATETIME_FORMAT = 'DD.MM.YYYY HH:mm';

// Application Settings
export const APP_CONFIG = {
  NAME: 'Maktab Boshqaruv Tizimi',
  VERSION: '2.0.0',
  AUTHOR: 'School Management Team',
  DEFAULT_LANGUAGE: 'uz'
};

// Grade helpers
export const GRADE_COLORS = {
  EXCELLENT: '#10B981', // 90-100%
  GOOD: '#059669',      // 80-89%
  AVERAGE: '#F59E0B',   // 70-79%
  POOR: '#EF4444',      // 60-69%
  FAIL: '#DC2626'       // Below 60%
};

export const getGradeColor = (percentage) => {
  if (percentage >= 90) return GRADE_COLORS.EXCELLENT;
  if (percentage >= 80) return GRADE_COLORS.GOOD;
  if (percentage >= 70) return GRADE_COLORS.AVERAGE;
  if (percentage >= 60) return GRADE_COLORS.POOR;
  return GRADE_COLORS.FAIL;
};

export const getGradeLetter = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};