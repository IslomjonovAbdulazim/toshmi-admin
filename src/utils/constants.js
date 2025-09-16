export const API_BASE_URL = 'https://toshmibackend-production.up.railway.app';

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
  SCHEDULE: '/schedule',
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

export const DAYS_OF_WEEK = {
  0: 'Monday',
  1: 'Tuesday', 
  2: 'Wednesday',
  3: 'Thursday',
  4: 'Friday',
  5: 'Saturday',
  6: 'Sunday',
};