import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  business_name: string;
  business_type: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  email_verified: boolean;
}

export interface Merchant {
  id: string;
  business_name: string;
  business_email: string;
  business_type: string;
  country: string;
  kyc_status: string;
  is_live: boolean;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  register: async (registerData: RegisterData) => {
    const { data } = await api.post('/auth/register', registerData);
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token: string, password: string) => {
    const { data } = await api.post('/auth/reset-password', { token, password });
    return data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  },
};
