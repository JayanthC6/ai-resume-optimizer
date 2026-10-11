import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@repo/types';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  setAuth: (user: UserProfile, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'hiredlens-auth',
    }
  )
);
