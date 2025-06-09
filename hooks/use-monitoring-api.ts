import { useCallback, useState, useEffect } from 'react';
import { useApi, useApiCall } from './use-api';

export interface MonitoringStatus {
  isActive: boolean;
  startedAt?: string;
  lastCheck?: string;
  tradesCount: {
    owner: number;
    shadow: number;
    slave: number;
  };
  errors: string[];
}

export function useMonitoringApi() {
  const { call, loading } = useApiCall();
  const statusApi = useApi<MonitoringStatus>();
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Iniciar monitoramento
  const startMonitoring = useCallback(async () => {
    const result = await call<{ message: string }>('/api/monitoring/start', {
      method: 'POST',
    });

    // Atualizar status após iniciar
    if (result.data) {
      await getStatus();
    }

    return result;
  }, [call]);

  // Parar monitoramento
  const stopMonitoring = useCallback(async () => {
    const result = await call<{ message: string }>('/api/monitoring/stop', {
      method: 'POST',
    });

    // Atualizar status após parar
    if (result.data) {
      await getStatus();
    }

    return result;
  }, [call]);

  // Obter status do monitoramento
  const getStatus = useCallback(async () => {
    return await statusApi.execute('/api/monitoring/status');
  }, [statusApi]);

  // Toggle monitoramento
  const toggleMonitoring = useCallback(async () => {
    if (statusApi.data?.isActive) {
      return await stopMonitoring();
    } else {
      return await startMonitoring();
    }
  }, [statusApi.data?.isActive, startMonitoring, stopMonitoring]);

  // Auto-refresh do status
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      getStatus();
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, getStatus]);

  // Carregar status inicial
  useEffect(() => {
    getStatus();
  }, []);

  return {
    startMonitoring,
    stopMonitoring,
    getStatus,
    toggleMonitoring,
    
    // Status
    status: statusApi.data,
    statusLoading: statusApi.loading,
    statusError: statusApi.error,
    
    // Auto-refresh
    autoRefresh,
    setAutoRefresh,
    
    // Loading geral
    loading,
    
    // Helpers
    isActive: statusApi.data?.isActive || false,
    tradesCount: statusApi.data?.tradesCount || { owner: 0, shadow: 0, slave: 0 },
    hasErrors: (statusApi.data?.errors?.length || 0) > 0,
  };
} 