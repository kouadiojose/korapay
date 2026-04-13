import { create } from 'zustand';
import { authApi, type User, type Merchant } from '@/lib/auth';

interface AuthState {
  user: User | null;
  merchant: Merchant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setMerchant: (merchant: Merchant | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  merchant: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setMerchant: (merchant) => set({ merchant }),

  login: async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const { access_token, refresh_token, user, merchant } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    set({ user, merchant, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    authApi.logout();
    set({ user: null, merchant: null, isAuthenticated: false, isLoading: false });
  },

  fetchProfile: async () => {
    try {
      const response = await authApi.getProfile();
      set({
        user: response.data.user,
        merchant: response.data.merchant,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ user: null, merchant: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
