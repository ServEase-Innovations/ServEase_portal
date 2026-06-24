// src/types/index.ts
export type Role = 'super-admin' | 'hr-partner' | 'manager' | 'employee';

export interface User {
  id: string;
  name?: string;
  email: string;
  mobileNumber?: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdById?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: Role;
}

export interface CreateAccountData {
  name: string;
  email: string;
  password: string;
  role: Role;
  mobileNumber?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Team {
  id: string;
  name: string;
  projectName: string;
  description?: string;
  managerId: string;
  manager?: User;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user?: User;
  joinedAt: string;
}