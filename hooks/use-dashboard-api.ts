import { useCallback, useState, useEffect } from 'react';
import { useApi } from './use-api';

export interface DashboardStats {
  overview: {
    totalAccounts: number;
    activeAssociations: number;
    unreadNotifications: number;
    monitoringActive: boolean;
    autoCloseSuccessRate: number;
  };
  accounts: {
    owner: number;
    shadow: number;
    slave: number;
  };
  associations: {
    total: number;
    last24Hours: number;
  };
  notifications: {
    unread: number;
    byType: Record<string, number>;
  };
  monitoring: {
    isActive: boolean;
    tradesCount: {
      owner: number;
      shadow: number;
      slave: number;
    };
  };
  autoClose: {
    total: number;
    closed: number;
    successRate: number;
  };
}

export interface TradeData {
  id: string;
  account_type: 'owner' | 'shadow' | 'slave';
  status: 'open' | 'closed';
  side: 'buy' | 'sell';
  quantity: number;
  margin: number;
  pnl: number;
  fees: number;
  net_pnl: number;
  opened_at: string;
  closed_at?: string;
}

export interface TradesResponse {
  trades: TradeData[];
  total: number;
  stats: {
    totalPnl: number;
    totalFees: number;
    totalNetPnl: number;
    winRate: number;
    byAccount: Record<string, {
      count: number;
      pnl: number;
      netPnl: number;
      winRate: number;
    }>;
  };
}

export interface PerformanceData {
  period: string;
  accounts: {
    owner: {
      pnl: number;
      netPnl: number;
      trades: number;
      winRate: number;
    };
    shadow: {
      pnl: number;
      netPnl: number;
      trades: number;
      winRate: number;
    };
    slave: {
      pnl: number;
      netPnl: number;
      trades: number;
      winRate: number;
    };
  };
  timeline: Array<{
    date: string;
    pnl: number;
    netPnl: number;
    trades: number;
  }>;
}

export interface DashboardFilters {
  status?: 'open' | 'closed' | 'all';
  account_type?: 'owner' | 'shadow' | 'slave' | 'all';
  period?: '1d' | '7d' | '30d' | 'all';
  limit?: number;
  offset?: number;
}

export function useDashboardApi() {
  const statsApi = useApi<DashboardStats>();
  const tradesApi = useApi<TradesResponse>();
  const performanceApi = useApi<PerformanceData>();
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Obter estatísticas gerais
  const getStats = useCallback(async () => {
    return await statsApi.execute('/api/dashboard/stats');
  }, [statsApi]);

  // Obter histórico de trades
  const getTrades = useCallback(async (filters: DashboardFilters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const url = `/api/dashboard/trades${params.toString() ? `?${params.toString()}` : ''}`;
    return await tradesApi.execute(url);
  }, [tradesApi]);

  // Obter dados de performance
  const getPerformance = useCallback(async (period: string = '30d', groupBy: string = 'day') => {
    const params = new URLSearchParams({ period, group_by: groupBy });
    return await performanceApi.execute(`/api/dashboard/performance?${params.toString()}`);
  }, [performanceApi]);

  // Atualizar todos os dados
  const refreshAll = useCallback(async (filters?: DashboardFilters) => {
    await Promise.all([
      getStats(),
      getTrades(filters),
      getPerformance(),
    ]);
  }, [getStats, getTrades, getPerformance]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshAll();
    }, 60000); // Atualizar a cada 1 minuto

    return () => clearInterval(interval);
  }, [autoRefresh, refreshAll]);

  // Carregar dados iniciais
  useEffect(() => {
    refreshAll();
  }, []);

  return {
    // Métodos
    getStats,
    getTrades,
    getPerformance,
    refreshAll,

    // Dados
    stats: statsApi.data,
    trades: tradesApi.data,
    performance: performanceApi.data,

    // Loading states
    statsLoading: statsApi.loading,
    tradesLoading: tradesApi.loading,
    performanceLoading: performanceApi.loading,
    loading: statsApi.loading || tradesApi.loading || performanceApi.loading,

    // Errors
    statsError: statsApi.error,
    tradesError: tradesApi.error,
    performanceError: performanceApi.error,
    hasError: !!(statsApi.error || tradesApi.error || performanceApi.error),

    // Auto-refresh
    autoRefresh,
    setAutoRefresh,

    // Helpers
    totalAccounts: statsApi.data?.overview.totalAccounts || 0,
    activeAssociations: statsApi.data?.overview.activeAssociations || 0,
    unreadNotifications: statsApi.data?.overview.unreadNotifications || 0,
    monitoringActive: statsApi.data?.overview.monitoringActive || false,
    autoCloseSuccessRate: statsApi.data?.overview.autoCloseSuccessRate || 0,
  };
} 