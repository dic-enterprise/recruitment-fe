import type { CurrentUser, LoginResponse } from '@/shared/types/api';

const KEYS = {
  accessToken: 'recruitment.accessToken',
  tokenType: 'recruitment.tokenType',
  expiresAt: 'recruitment.expiresAt',
  user: 'recruitment.user',
} as const;

export function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem(KEYS.expiresAt);
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() <= Date.now();
}

export function getAccessToken(): string | null {
  const token = localStorage.getItem(KEYS.accessToken);
  if (!token || isTokenExpired()) return null;
  return token;
}

export function getStoredUser(): CurrentUser | null {
  const raw = localStorage.getItem(KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function persistAuthSession(login: LoginResponse): CurrentUser {
  const expiresAt = new Date(Date.now() + login.expiresInSeconds * 1000).toISOString();
  const user: CurrentUser = {
    userId: login.userId,
    username: login.username,
    displayName: login.displayName,
    role: login.role,
  };

  localStorage.setItem(KEYS.accessToken, login.accessToken);
  localStorage.setItem(KEYS.tokenType, login.tokenType);
  localStorage.setItem(KEYS.expiresAt, expiresAt);
  localStorage.setItem(KEYS.user, JSON.stringify(user));
  localStorage.removeItem('auth_token');

  return user;
}

export function persistUser(user: CurrentUser): void {
  localStorage.setItem(KEYS.user, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(KEYS.accessToken);
  localStorage.removeItem(KEYS.tokenType);
  localStorage.removeItem(KEYS.expiresAt);
  localStorage.removeItem(KEYS.user);
  localStorage.removeItem('auth_token');
}

export function hasValidSession(): boolean {
  return !!getAccessToken();
}
