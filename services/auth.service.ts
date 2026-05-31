import { API } from '@/constants/api';
import { apiGet, apiPost, apiPut, clearToken, setToken } from './api';

export interface User {
  id: number;
  phone: string;
  fullName: string;
  role: string;           // CONSUMER | PRODUCER | ADMIN | RELAY | FINANCE
  status: string;         // ACTIVE | PENDING | SUSPENDED | DELETED
  momoNumber?: string;
  momoProvider?: string;
  zoneName?: string;
  zoneId?: number;
  avatarUrl?: string;
  ratingAvg?: number;
  ratingCount?: number;
  createdAt?: string;
  arrondissement?: string; // Consumer preferred district
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function login(phone: string, password: string): Promise<AuthResponse> {
  const res = await apiPost<AuthResponse>(API.LOGIN, { phone, password }, false);
  await setToken(res.token);
  return res;
}

export async function register(data: {
  fullName: string;
  phone: string;
  password: string;
  arrondissement?: string;
}): Promise<AuthResponse> {
  const res = await apiPost<AuthResponse>(
    API.REGISTER,
    { ...data, role: 'CONSUMER' },
    false
  );
  await setToken(res.token);
  return res;
}

export async function getMe(): Promise<User> {
  return apiGet<User>(API.ME);
}

export async function updateMe(data: Partial<User>): Promise<User> {
  const payload: Record<string, string> = {};
  if (data.fullName) payload.fullName = data.fullName;
  if (data.momoNumber) payload.momoNumber = data.momoNumber;
  if (data.momoProvider) payload.momoProvider = data.momoProvider;
  if (data.arrondissement) payload.arrondissement = data.arrondissement;
  if (data.zoneId) payload.zoneId = String(data.zoneId);
  return apiPut<User>(API.UPDATE_ME, payload);
}

export async function logout(): Promise<void> {
  await clearToken();
}
