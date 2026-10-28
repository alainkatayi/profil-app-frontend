import { normalizeUser, UserResponse } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: UserResponse;
}

export function readAuth(raw: unknown): AuthResponse {
  const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const type = text(data['type'] ?? data['Type']).trim();
  return {
    token: text(data['token'] ?? data['Token']).trim(),
    type: type || 'Bearer',
    user: normalizeUser(data['user'] ?? data['User'] ?? {}),
  };
}

function text(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}
