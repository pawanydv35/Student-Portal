export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  department: string;
  profilePicture?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: 'student' | 'faculty' | 'admin';
}

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  faculty: string;
  students: number;
  schedule: string;
}