'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthApi, AuthResponse } from '../hooks/use-auth-api';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authApi = useAuthApi();

  // Verificar autenticação ao carregar
  const checkAuth = () => {
    const currentUser = authApi.getCurrentUser();
    const isAuth = authApi.isAuthenticated();
    
    if (isAuth && currentUser) {
      setUser(currentUser);
    } else {
      setUser(null);
      // Limpar dados se inválidos
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const result = await authApi.login({ email, password });
      
      if (result.data) {
        setUser(result.data.user);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Erro no login' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro no login' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, confirmPassword: string) => {
    setIsLoading(true);
    
    try {
      const result = await authApi.register({ email, password, confirmPassword });
      
      if (result.data) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Erro no registro' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro no registro' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 