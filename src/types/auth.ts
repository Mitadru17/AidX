export type UserRole = 'doctor' | 'patient';

export interface User {
  email: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
} 