export type UserRole = 'doctor' | 'patient';

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  photoURL: string | null;
}
