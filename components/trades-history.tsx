'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Filter,
  ArrowUpDown,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';

interface Trade {
  id: string;
  tradeId: string;
  accountType: 'owner' | 'shadow' | 'slave';
  status: 'open' | 'closed';
  quantity: number;
  margin: number;
  pnl: number;
  fees: number;
  netPnl: number;
  openedAt: string;
  closedAt: string | null;
  lastChecked: string;
  side: 'buy' | 'sell' | 'unknown';
  leverage: number;
  entryPrice: number;
  exitPrice: number | null;
}

interface TradeStats {
  total: number;
  open: number;
  closed: number;
  profitable: number;
  unprofitable: number;
  totalPnl: number;
  totalFees: number;
  totalNetPnl: number;
  averagePnl: number;
  winRate: number;
  byAccountType: {
    owner: { count: number; pnl: number; netPnl: number };
    shadow: { count: number; pnl: number; netPnl: number };
    slave: { count: number; pnl: number; netPnl: number };
  };
  bySide: {
    buy: { count: number; pnl: number };
    sell: { count: number; pnl: number };
  };
}

interface TradesData {
  trades: Trade[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  filters: {
    status: string | null;
    accountType: string | null;
    period: string;
    startDate: Date | null;
  };
  stats: TradeStats;
}

export function TradesHistory() {
  const [data, setData] = useState<TradesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('7d');
  const [currentPage, setCurrentPage] = useState(0);
  
  const limit = 50;

  const fetchTrades = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (currentPage * limit).toString(),
        period: periodFilter
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (accountTypeFilter !== 'all') {
        params.append('account_type', accountTypeFilter);
      }

      const response = await fetch(`/api/dashboard/trades?${params}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar histórico de trades');
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Erro nos dados recebidos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [statusFilter, accountTypeFilter, periodFilter, currentPage]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'owner': return 'bg-blue-100 text-blue-800';
      case 'shadow': return 'bg-green-100 text-green-800';
      case 'slave': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPnlColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-600';
    if (pnl < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando histórico...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <Activity className="h-5 w-5" />
            <span>Erro: {error}</span>
          </div>
          <Button 
            onClick={fetchTrades} 
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

  if (!data) {
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
          <h2 className="text-2xl font-bold">Histórico de Trades</h2>
          <p className="text-muted-foreground">
            Visualize e analise o histórico completo de trades
          </p>
        </div>
        <Button onClick={fetchTrades} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total de Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.total}</div>
            <div className="text-xs text-muted-foreground">
              {data.stats.open} abertos, {data.stats.closed} fechados
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              P&L Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPnlColor(data.stats.totalNetPnl)}`}>
              {formatCurrency(data.stats.totalNetPnl)}
            </div>
            <div className="text-xs text-muted-foreground">
              Bruto: {formatCurrency(data.stats.totalPnl)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Taxa de Vitória
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.winRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              {data.stats.profitable} ganhos, {data.stats.unprofitable} perdas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Taxas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.stats.totalFees)}
            </div>
            <div className="text-xs text-muted-foreground">
              Média: {formatCurrency(data.stats.totalFees / Math.max(data.stats.total, 1))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="open">Abertos</SelectItem>
                  <SelectItem value="closed">Fechados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Conta</label>
              <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="shadow">Shadow</SelectItem>
                  <SelectItem value="slave">Slave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Último dia</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setCurrentPage(0);
                  fetchTrades();
                }} 
                className="w-full"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Trades ({data.pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lado</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>Taxas</TableHead>
                  <TableHead>P&L Líquido</TableHead>
                  <TableHead>Aberto em</TableHead>
                  <TableHead>Fechado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.trades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-mono text-xs">
                      {trade.tradeId.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getAccountTypeColor(trade.accountType)}>
                        {trade.accountType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(trade.status)}>
                        {trade.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={trade.side === 'buy' ? 'default' : 'secondary'}>
                        {trade.side}
                      </Badge>
                    </TableCell>
                    <TableCell>{trade.quantity.toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(trade.margin)}</TableCell>
                    <TableCell className={getPnlColor(trade.pnl)}>
                      {formatCurrency(trade.pnl)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {formatCurrency(trade.fees)}
                    </TableCell>
                    <TableCell className={getPnlColor(trade.netPnl)}>
                      <span className="font-medium">
                        {formatCurrency(trade.netPnl)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTimestamp(trade.openedAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {trade.closedAt ? formatTimestamp(trade.closedAt) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {data.pagination.total > limit && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {data.pagination.offset + 1} a {Math.min(data.pagination.offset + limit, data.pagination.total)} de {data.pagination.total} trades
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!data.pagination.hasMore}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas por Tipo de Conta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Trades:</span>
                <span className="font-medium">{data.stats.byAccountType.owner.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">P&L:</span>
                <span className={`font-medium ${getPnlColor(data.stats.byAccountType.owner.pnl)}`}>
                  {formatCurrency(data.stats.byAccountType.owner.pnl)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">P&L Líquido:</span>
                <span className={`font-medium ${getPnlColor(data.stats.byAccountType.owner.netPnl)}`}>
                  {formatCurrency(data.stats.byAccountType.owner.netPnl)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Shadow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Trades:</span>
                <span className="font-medium">{data.stats.byAccountType.shadow.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">P&L:</span>
                <span className={`font-medium ${getPnlColor(data.stats.byAccountType.shadow.pnl)}`}>
                  {formatCurrency(data.stats.byAccountType.shadow.pnl)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">P&L Líquido:</span>
                <span className={`font-medium ${getPnlColor(data.stats.byAccountType.shadow.netPnl)}`}>
                  {formatCurrency(data.stats.byAccountType.shadow.netPnl)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600">Slave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Trades:</span>
                <span className="font-medium">{data.stats.byAccountType.slave.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">P&L:</span>
                <span className={`font-medium ${getPnlColor(data.stats.byAccountType.slave.pnl)}`}>
                  {formatCurrency(data.stats.byAccountType.slave.pnl)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">P&L Líquido:</span>
                <span className={`font-medium ${getPnlColor(data.stats.byAccountType.slave.netPnl)}`}>
                  {formatCurrency(data.stats.byAccountType.slave.netPnl)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 