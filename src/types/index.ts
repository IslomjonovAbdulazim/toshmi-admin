export interface User {
  id: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  phone: number;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  students?: Student[];
}

export interface Subject {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  user_id: string;
  group_id: string;
  graduation_year: number;
  user?: User;
  group?: Group;
}

export interface GroupSubject {
  id: string;
  group_id: string;
  subject_id: string;
  group?: Group;
  subject?: Subject;
}

export interface Schedule {
  id: string;
  group_id: string;
  group_subject_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
  group_subject?: {
    subject?: {
      name: string;
    };
  };
}

export interface Payment {
  id: string;
  student_id: string;
  month: number;
  year: number;
  amount_paid: number;
  is_fully_paid: boolean;
  paid_at: string;
  comment?: string;
  student?: Student;
}

export interface News {
  id: string;
  title: string;
  body: string;
  media_urls?: string[];
  links?: string[];
  created_at: string;
}