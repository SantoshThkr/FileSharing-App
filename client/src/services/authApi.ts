import api, { ApiResponse } from './api';
import { AuthResponse, LoginData, RegisterData, User } from '../types/auth';

export async function login(data: LoginData) {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return res.data.data;
}

export async function register(data: RegisterData) {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return res.data.data;
}

export async function getMe() {
  const res = await api.get<ApiResponse<User>>('/auth/me');
  return res.data.data;
}
