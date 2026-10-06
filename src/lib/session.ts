import type { UserResponse } from './api';
 
const TOKEN_KEY = 'cifrawealth:token';
const USER_KEY = 'cifrawealth:user';
 
export const session = {
  save(token: string, user: UserResponse): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
 
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
 
  getUser(): UserResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    try { return raw ? (JSON.parse(raw) as UserResponse) : null; } catch { return null; }
  },
 
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
 
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },
};