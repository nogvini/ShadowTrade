'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Link2, 
  Bell, 
  Monitor,
  DollarSign,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DashboardStats {
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
    total: number;
    active: number;
    inactive: number;
  };
  associations: {
    total: number;
    shadowToOwner: number;
    slaveToShadow: number;
    slaveToOwner: number;
    last24Hours: number;
  };
  notifications: {
    total: number;
    unread: number;
    read: number;
    last24Hours: number;
    byType: {
      trade_opened: number;
      trade_closed: number;
      warning: number;
      error: number;
      info: number;
    };
  };
  monitoring: {
    isActive: boolean;
    lastCheck: Date;
    activeAccounts: {
      owner: boolean;
      shadow: boolean;
      slave: boolean;
    };
    tradesCount: {
      open: number;
      closed: number;
      total: number;
    };
    tradesLast24h: number;
    totalTrades: number;
  };
  autoClose: {
    total: number;
    closed: number;
    skipped: number;
    failed: number;
    successRate: number;
  };
  lastUpdated: Date;
}

export function MainDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error || 'Erro nos dados recebidos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Atualiza a cada 60 segundos
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTimestamp = (timestamp: Date | string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Erro: {error}</span>
          </div>
          <Button 
            onClick={fetchStats} 
            variant="outline" 
            size="sm" 
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard ShadowTrade</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de trading hierárquico
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={stats.monitoring.isActive ? "default" : "secondary"}>
            {stats.monitoring.isActive ? 'Monitoramento Ativo' : 'Monitoramento Inativo'}
          </Badge>
          <Button onClick={fetchStats} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalAccounts}</div>
            <div className="text-xs text-muted-foreground">
              {stats.accounts.active} ativas, {stats.accounts.inactive} inativas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Associações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.activeAssociations}</div>
            <div className="text-xs text-muted-foreground">
              {stats.associations.last24Hours} nas últimas 24h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.unreadNotifications}</div>
            <div className="text-xs text-muted-foreground">
              {stats.notifications.last24Hours} nas últimas 24h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monitoring.tradesCount.total}</div>
            <div className="text-xs text-muted-foreground">
              {stats.monitoring.tradesCount.open} abertos, {stats.monitoring.tradesCount.closed} fechados
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Auto-Close
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.autoCloseSuccessRate}%</div>
            <div className="text-xs text-muted-foreground">
              Taxa de sucesso
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Monitoramento</span>
                  <div className="flex items-center gap-2">
                    {stats.monitoring.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={stats.monitoring.isActive ? 'text-green-600' : 'text-red-600'}>
                      {stats.monitoring.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Última Verificação</span>
                  <span className="text-sm text-muted-foreground">
                    {formatTimestamp(stats.monitoring.lastCheck)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Fechamento Automático</span>
                  <span className="text-sm font-medium">
                    {stats.autoClose.total} ações ({stats.autoClose.closed} fechados)
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Contas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Distribuição de Contas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Owner</span>
                    </div>
                    <span className="font-medium">{stats.accounts.owner}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Shadow</span>
                    </div>
                    <span className="font-medium">{stats.accounts.shadow}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span>Slave</span>
                    </div>
                    <span className="font-medium">{stats.accounts.slave}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Owner Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{stats.accounts.owner}</div>
                <p className="text-sm text-muted-foreground">
                  Contas principais que iniciam trades
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Shadow Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{stats.accounts.shadow}</div>
                <p className="text-sm text-muted-foreground">
                  Contas que seguem com condições
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">Slave Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{stats.accounts.slave}</div>
                <p className="text-sm text-muted-foreground">
                  Contas que seguem automaticamente
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Associações Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.associations.shadowToOwner}
                  </div>
                  <div className="text-sm text-muted-foreground">Shadow → Owner</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.associations.slaveToShadow}
                  </div>
                  <div className="text-sm text-muted-foreground">Slave → Shadow</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.associations.slaveToOwner}
                  </div>
                  <div className="text-sm text-muted-foreground">Slave → Owner</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status do Monitoramento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Sistema de Monitoramento</span>
                  <Badge variant={stats.monitoring.isActive ? "default" : "destructive"}>
                    {stats.monitoring.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Contas Monitoradas</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Owner</span>
                      <Badge variant={stats.monitoring.activeAccounts.owner ? "default" : "secondary"}>
                        {stats.monitoring.activeAccounts.owner ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Shadow</span>
                      <Badge variant={stats.monitoring.activeAccounts.shadow ? "default" : "secondary"}>
                        {stats.monitoring.activeAccounts.shadow ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Slave</span>
                      <Badge variant={stats.monitoring.activeAccounts.slave ? "default" : "secondary"}>
                        {stats.monitoring.activeAccounts.slave ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Trades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.monitoring.tradesCount.open}
                    </div>
                    <div className="text-sm text-muted-foreground">Abertos</div>
                  </div>

                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.monitoring.tradesCount.closed}
                    </div>
                    <div className="text-sm text-muted-foreground">Fechados</div>
                  </div>
                </div>

                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {stats.monitoring.tradesLast24h}
                  </div>
                  <div className="text-sm text-muted-foreground">Trades nas últimas 24h</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Notificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.notifications.unread}
                    </div>
                    <div className="text-sm text-muted-foreground">Não Lidas</div>
                  </div>

                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.notifications.read}
                    </div>
                    <div className="text-sm text-muted-foreground">Lidas</div>
                  </div>
                </div>

                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {stats.notifications.last24Hours}
                  </div>
                  <div className="text-sm text-muted-foreground">Últimas 24h</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Trades Abertos</span>
                    <span className="font-medium">{stats.notifications.byType.trade_opened}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Trades Fechados</span>
                    <span className="font-medium">{stats.notifications.byType.trade_closed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avisos</span>
                    <span className="font-medium">{stats.notifications.byType.warning}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Erros</span>
                    <span className="font-medium">{stats.notifications.byType.error}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Informações</span>
                    <span className="font-medium">{stats.notifications.byType.info}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        Última atualização: {formatTimestamp(stats.lastUpdated)}
      </div>
    </div>
  );
} 