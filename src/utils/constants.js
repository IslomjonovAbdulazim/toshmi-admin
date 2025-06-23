export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://islomjonovabdulazim-toshmi-backend-ac2b.twc1.net';

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late'
};

export const MENU_ITEMS = [
  { path: '/', label: 'Asosiy sahifa', icon: '🏠' },
  { path: '/users', label: 'Foydalanuvchilar', icon: '👥' },
  { path: '/students', label: "O'quvchilar", icon: '🎓' },
  { path: '/payments', label: "To'lovlar", icon: '💰' },
  { path: '/news', label: 'Yangiliklar', icon: '📰' },
  { path: '/reports', label: 'Hisobotlar', icon: '📊' }
];

export const UZBEK_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

export const FILE_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document'
};