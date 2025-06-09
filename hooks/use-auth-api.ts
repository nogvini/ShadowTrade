import { useCallback } from 'react';
import { useApiCall } from './use-api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  token?: string;
  message: string;
}

export function useAuthApi() {
  const { call, loading } = useApiCall();

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await call<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: credentials,
    });

    if (result.data?.token) {
      // Salvar token no localStorage
      localStorage.setItem('auth_token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }

    return result;
  }, [call]);

  const register = useCallback(async (data: RegisterData) => {
    return await call<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: data,
    });
  }, [call]);

  const logout = useCallback(async () => {
    const result = await call('/api/auth/login', {
      method: 'DELETE',
    });

    // Limpar dados locais
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');

    return result;
  }, [call]);

  const getCurrentUser = useCallback(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    
    if (!userStr || !token) {
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }, []);

  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    const user = getCurrentUser();
    return !!(token && user);
  }, [getCurrentUser]);

  return {
    login,
    register,
    logout,
    getCurrentUser,
    isAuthenticated,
    loading,
  };
} 