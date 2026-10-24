import type { UserResponse } from './api';

const TOKEN_KEY = 'cifrawealth:token';
const USER_KEY = 'cifrawealth:user';
const CHANGE_EVENT = 'cifrawealth:session-change';
let cachedRaw: string | null = null;
let cachedUser: UserResponse | null = null;
let endNotice: string | undefined;

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export const session = {
  save(token: string, user: UserResponse): void {
    endNotice = undefined;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    notify();
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): UserResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    if (raw === cachedRaw) return cachedUser;
    cachedRaw = raw;
    try {
      const value: unknown = raw ? JSON.parse(raw) : null;
      cachedUser =
        value &&
        typeof value === 'object' &&
        'id_usuario' in value &&
        'nome' in value &&
        'email' in value &&
        typeof value.nome === 'string' &&
        typeof value.email === 'string'
          ? (value as UserResponse)
          : null;
    } catch {
      cachedUser = null;
    }
    return cachedUser;
  },

  updateUser(user: UserResponse): void {
    if (!this.getToken()) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    notify();
  },

  subscribe(callback: () => void): () => void {
    const storage = (event: StorageEvent) => {
      if (
        event.key === USER_KEY ||
        event.key === TOKEN_KEY ||
        event.key === null
      )
        callback();
    };
    window.addEventListener(CHANGE_EVENT, callback);
    window.addEventListener('storage', storage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, callback);
      window.removeEventListener('storage', storage);
    };
  },

  getEndNotice(): string | undefined {
    return endNotice;
  },

  clear(notice?: string): void {
    endNotice = notice;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    notify();
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },
};
