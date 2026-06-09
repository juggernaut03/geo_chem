import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: (() => {
    try { return JSON.parse(localStorage.getItem('gc_user') || 'null'); } catch { return null; }
  })(),
  token: localStorage.getItem('gc_token'),

  setAuth: (user, token) => {
    localStorage.setItem('gc_token', token);
    localStorage.setItem('gc_user', JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('gc_token');
    localStorage.removeItem('gc_user');
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!get().token,
}));
