import { User } from '@/services/auth.service';
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  setUser: (user: User | null) => void;
  setLoading: (v: boolean) => void;
  setOnboarded: (v: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isOnboarded: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setOnboarded: (isOnboarded) => set({ isOnboarded }),
  reset: () => set({ user: null, isLoading: false }),
}));
