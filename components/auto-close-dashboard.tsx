'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  SkipForward, 
  TrendingUp, 
  Clock,
  RefreshCw
} from 'lucide-react';

interface AutoCloseStats {
  overall: {
    total: number;
    closed: number;
    skipped: number;
    failed: number;
    successRate: number;
  };
  last24Hours: {
    total: number;
    closed: number;
    skipped: number;
    failed: number;
  };
  byAccountType: Record<string, {
    closed: number;
    skipped: number;
    failed: number;
  }>;
  recentActivity: Array<{
    timestamp: Date;
    action: 'closed' | 'skipped' | 'failed';
    trigger: string;
    target: string;
    reason: string;
  }>;
}

interface AutoCloseLog {
  id: string;
  userId: string;
  triggerTradeId: string;
  triggerAccountType: string;
  targetTradeId: string;
  targetAccountType: string;
  action: 'closed' | 'skipped' | 'failed';
  reason: string;
  timestamp: Date;
  error?: string;
}

export function AutoCloseDashboard() {
  const [stats, setStats] = useState<AutoCloseStats | null>(null);
  const [logs, setLogs] = useState<AutoCloseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Busca estatísticas e logs em paralelo
      const [statsResponse, logsResponse] = await Promise.all([
        fetch('/api/auto-close/stats?user_filter=true'),
        fetch('/api/auto-close/logs?user_filter=true&limit=20')
      ]);

      if (!statsResponse.ok || !logsResponse.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const statsData = await statsResponse.json();
      const logsData = await logsResponse.json();

      if (statsData.success && logsData.success) {
        setStats(statsData.data);
        setLogs(logsData.data.logs);
      } else {
        throw new Error('Erro nos dados recebidos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'skipped':
        return <SkipForward className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'closed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'skipped':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
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
        <span>Carregando dados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>Erro: {error}</span>
          </div>
          <Button 
            onClick={fetchData} 
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
          <h2 className="text-2xl font-bold">Fechamento Automático</h2>
          <p className="text-muted-foreground">
            Monitoramento e estatísticas do sistema de fechamento automático
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Ações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overall.total}</div>
            <div className="text-xs text-muted-foreground">
              Últimas 24h: {stats.last24Hours.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fechamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{stats.overall.closed}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Últimas 24h: {stats.last24Hours.closed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.overall.successRate}%</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.overall.closed} de {stats.overall.closed + stats.overall.failed} tentativas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Falhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{stats.overall.failed}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Últimas 24h: {stats.last24Hours.failed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
          <TabsTrigger value="logs">Logs Detalhados</TabsTrigger>
          <TabsTrigger value="rules">Regras de Fechamento</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma atividade recente
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getActionIcon(activity.action)}
                        <div>
                          <div className="font-medium">
                            {activity.trigger} → {activity.target}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {activity.reason}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getActionColor(activity.action)}>
                          {activity.action}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs Detalhados</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum log disponível
                  </p>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div key={log.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            <Badge className={getActionColor(log.action)}>
                              {log.action}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">
                            {log.triggerAccountType}:{log.triggerTradeId} → {log.targetAccountType}:{log.targetTradeId}
                          </div>
                          <div className="text-muted-foreground mt-1">
                            {log.reason}
                          </div>
                          {log.error && (
                            <div className="text-red-600 mt-1 text-xs">
                              Erro: {log.error}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Fechamento Automático</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-green-50">
                  <h4 className="font-medium text-green-800 mb-2">
                    Owner → Shadow (Condicional)
                  </h4>
                  <p className="text-sm text-green-700">
                    Quando um trade Owner é fechado, o trade Shadow associado será fechado 
                    <strong> apenas se</strong> a opção "shadow_close" estiver habilitada na configuração Shadow.
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Owner → Slave (Obrigatório)
                  </h4>
                  <p className="text-sm text-blue-700">
                    Quando um trade Owner é fechado, o trade Slave associado será 
                    <strong> sempre</strong> fechado automaticamente.
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-purple-50">
                  <h4 className="font-medium text-purple-800 mb-2">
                    Shadow → Slave (Obrigatório)
                  </h4>
                  <p className="text-sm text-purple-700">
                    Quando um trade Shadow é fechado, o trade Slave associado será 
                    <strong> sempre</strong> fechado automaticamente.
                  </p>
                </div>

                {/* Estatísticas por tipo */}
                {Object.keys(stats.byAccountType).length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Estatísticas por Tipo de Associação</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {Object.entries(stats.byAccountType).map(([key, data]) => (
                        <div key={key} className="p-3 border rounded-lg">
                          <div className="font-medium text-sm mb-2">
                            {key.replace('_to_', ' → ').toUpperCase()}
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600">✓ {data.closed}</span>
                            <span className="text-yellow-600">⏭ {data.skipped}</span>
                            <span className="text-red-600">✗ {data.failed}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 