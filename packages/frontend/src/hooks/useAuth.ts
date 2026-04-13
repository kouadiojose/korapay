'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const { user, merchant, isAuthenticated, isLoading, fetchProfile, logout } = useAuthStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && !isAuthenticated && isLoading) {
        fetchProfile();
      } else if (!token) {
        useAuthStore.setState({ isLoading: false });
      }
    }
  }, [isAuthenticated, isLoading, fetchProfile]);

  return {
    user,
    merchant,
    isAuthenticated,
    isLoading,
    logout,
  };
}
