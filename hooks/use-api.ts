import { useState, useCallback } from 'react';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = useCallback(async (
    url: string, 
    options: ApiOptions = {}
  ): Promise<T | null> => {
    const {
      method = 'GET',
      body,
      headers = {},
      retries = 3,
      retryDelay = 1000,
    } = options;

    setState(prev => ({ ...prev, loading: true, error: null }));

    const makeRequest = async (attempt: number): Promise<T | null> => {
      try {
        const requestHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...headers,
        };

        // Adicionar token JWT se disponível
        const token = localStorage.getItem('auth_token');
        if (token) {
          requestHeaders.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          credentials: 'include', // Para cookies httpOnly
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setState({ data, error: null, loading: false });
        return data;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        // Retry logic
        if (attempt < retries && !errorMessage.includes('401') && !errorMessage.includes('403')) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          return makeRequest(attempt + 1);
        }

        setState({ data: null, error: errorMessage, loading: false });
        throw error;
      }
    };

    return makeRequest(1);
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook para requests simples sem estado
export function useApiCall() {
  const [loading, setLoading] = useState(false);

  const call = useCallback(async <T>(
    url: string,
    options: ApiOptions = {}
  ): Promise<{ data: T | null; error: string | null }> => {
    setLoading(true);
    
    try {
      const {
        method = 'GET',
        body,
        headers = {},
      } = options;

      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      const token = localStorage.getItem('auth_token');
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, error: null };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading };
} 