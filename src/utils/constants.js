export const API_BASE_URL = 'https://islomjonovabdulazim-toshmi-backend-0914.twc1.net';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  STUDENTS: '/students',
  TEACHERS: '/teachers',
  PARENTS: '/parents',
  GROUPS: '/groups',
  SUBJECTS: '/subjects',
  NEWS: '/news',
  PAYMENTS: '/payments',
  ASSIGNMENTS: '/assignments',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
};