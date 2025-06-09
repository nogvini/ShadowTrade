import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação aqui
    // const userId = await getUserFromRequest(request);
    const userId = 'temp-user-id'; // Temporário para desenvolvimento

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // '1d' | '7d' | '30d' | '90d' | 'all'
    const groupBy = searchParams.get('group_by') || 'day'; // 'hour' | 'day' | 'week' | 'month'

    // Calcula data de início baseada no período
    const startDate = getStartDateForPeriod(period);

    // Busca dados de performance
    const [
      accountPerformance,
      timeSeriesData,
      comparisonData
    ] = await Promise.all([
      getAccountPerformance(userId, startDate),
      getTimeSeriesData(userId, startDate, groupBy),
      getComparisonData(userId, startDate)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        period,
        startDate,
        accounts: accountPerformance,
        timeSeries: timeSeriesData,
        comparison: comparisonData,
        summary: calculateSummary(accountPerformance)
      },
      message: 'Performance das contas obtida com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao obter performance das contas:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

/**
 * Calcula data de início baseada no período
 */
function getStartDateForPeriod(period: string): Date | null {
  const now = new Date();
  
  switch (period) {
    case '1d':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null;
  }
}

/**
 * Obtém performance por tipo de conta
 */
async function getAccountPerformance(userId: string, startDate: Date | null) {
  try {
    let query = supabaseAdmin
      .from('trade_monitoring')
      .select(`
        account_type,
        status,
        trade_data,
        created_at
      `)
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data: trades, error } = await query;

    if (error) throw error;

    const performance = {
      owner: initAccountStats(),
      shadow: initAccountStats(),
      slave: initAccountStats()
    };

    trades?.forEach(trade => {
      const accountType = trade.account_type as keyof typeof performance;
      const tradeData = trade.trade_data || {};
      const pnl = tradeData.pl || 0;
      const fees = (tradeData.opening_fee || 0) + (tradeData.closing_fee || 0);
      const netPnl = pnl - fees;

      if (performance[accountType]) {
        performance[accountType].totalTrades++;
        performance[accountType].totalPnl += pnl;
        performance[accountType].totalFees += fees;
        performance[accountType].netPnl += netPnl;

        if (trade.status === 'open') {
          performance[accountType].openTrades++;
        } else if (trade.status === 'closed') {
          performance[accountType].closedTrades++;
          
          if (netPnl > 0) {
            performance[accountType].winningTrades++;
            performance[accountType].totalWinAmount += netPnl;
          } else if (netPnl < 0) {
            performance[accountType].losingTrades++;
            performance[accountType].totalLossAmount += Math.abs(netPnl);
          }
        }

        // Atualiza melhor/pior trade
        if (netPnl > performance[accountType].bestTrade) {
          performance[accountType].bestTrade = netPnl;
        }
        if (netPnl < performance[accountType].worstTrade) {
          performance[accountType].worstTrade = netPnl;
        }
      }
    });

    // Calcula métricas derivadas
    Object.values(performance).forEach(stats => {
      if (stats.closedTrades > 0) {
        stats.winRate = (stats.winningTrades / stats.closedTrades) * 100;
        stats.averagePnl = stats.netPnl / stats.closedTrades;
      }
      
      if (stats.winningTrades > 0) {
        stats.averageWin = stats.totalWinAmount / stats.winningTrades;
      }
      
      if (stats.losingTrades > 0) {
        stats.averageLoss = stats.totalLossAmount / stats.losingTrades;
      }

      if (stats.averageLoss > 0) {
        stats.profitFactor = stats.totalWinAmount / stats.totalLossAmount;
      }
    });

    return performance;
  } catch (error) {
    console.error('Erro ao obter performance das contas:', error);
    return {
      owner: initAccountStats(),
      shadow: initAccountStats(),
      slave: initAccountStats()
    };
  }
}

/**
 * Obtém dados de série temporal
 */
async function getTimeSeriesData(userId: string, startDate: Date | null, groupBy: string) {
  try {
    let query = supabaseAdmin
      .from('trade_monitoring')
      .select(`
        account_type,
        trade_data,
        created_at
      `)
      .eq('user_id', userId)
      .eq('status', 'closed')
      .order('created_at', { ascending: true });

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data: trades, error } = await query;

    if (error) throw error;

    // Agrupa dados por período
    const groupedData = groupTradesByPeriod(trades || [], groupBy);
    
    return groupedData;
  } catch (error) {
    console.error('Erro ao obter dados de série temporal:', error);
    return [];
  }
}

/**
 * Obtém dados de comparação
 */
async function getComparisonData(userId: string, startDate: Date | null) {
  try {
    // Calcula período anterior para comparação
    const previousStartDate = startDate ? 
      new Date(startDate.getTime() - (Date.now() - startDate.getTime())) : 
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 dias atrás

    const [currentPeriod, previousPeriod] = await Promise.all([
      getAccountPerformance(userId, startDate),
      getAccountPerformance(userId, previousStartDate)
    ]);

    const comparison = {
      owner: calculateComparison(currentPeriod.owner, previousPeriod.owner),
      shadow: calculateComparison(currentPeriod.shadow, previousPeriod.shadow),
      slave: calculateComparison(currentPeriod.slave, previousPeriod.slave)
    };

    return comparison;
  } catch (error) {
    console.error('Erro ao obter dados de comparação:', error);
    return {
      owner: { netPnlChange: 0, winRateChange: 0, tradesChange: 0 },
      shadow: { netPnlChange: 0, winRateChange: 0, tradesChange: 0 },
      slave: { netPnlChange: 0, winRateChange: 0, tradesChange: 0 }
    };
  }
}

/**
 * Inicializa estatísticas de conta
 */
function initAccountStats() {
  return {
    totalTrades: 0,
    openTrades: 0,
    closedTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalPnl: 0,
    totalFees: 0,
    netPnl: 0,
    winRate: 0,
    averagePnl: 0,
    averageWin: 0,
    averageLoss: 0,
    bestTrade: 0,
    worstTrade: 0,
    profitFactor: 0,
    totalWinAmount: 0,
    totalLossAmount: 0
  };
}

/**
 * Agrupa trades por período
 */
function groupTradesByPeriod(trades: any[], groupBy: string) {
  const grouped: Record<string, any> = {};

  trades.forEach(trade => {
    const date = new Date(trade.created_at);
    const key = getGroupKey(date, groupBy);
    
    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        owner: { pnl: 0, trades: 0 },
        shadow: { pnl: 0, trades: 0 },
        slave: { pnl: 0, trades: 0 }
      };
    }

    const tradeData = trade.trade_data || {};
    const pnl = tradeData.pl || 0;
    const fees = (tradeData.opening_fee || 0) + (tradeData.closing_fee || 0);
    const netPnl = pnl - fees;

    const accountType = trade.account_type;
    if (grouped[key][accountType]) {
      grouped[key][accountType].pnl += netPnl;
      grouped[key][accountType].trades++;
    }
  });

  return Object.values(grouped).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Gera chave de agrupamento baseada no período
 */
function getGroupKey(date: Date, groupBy: string): string {
  switch (groupBy) {
    case 'hour':
      return date.toISOString().slice(0, 13) + ':00:00.000Z';
    case 'day':
      return date.toISOString().slice(0, 10);
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toISOString().slice(0, 10);
    case 'month':
      return date.toISOString().slice(0, 7);
    default:
      return date.toISOString().slice(0, 10);
  }
}

/**
 * Calcula comparação entre períodos
 */
function calculateComparison(current: any, previous: any) {
  return {
    netPnlChange: previous.netPnl !== 0 ? 
      ((current.netPnl - previous.netPnl) / Math.abs(previous.netPnl)) * 100 : 0,
    winRateChange: current.winRate - previous.winRate,
    tradesChange: current.totalTrades - previous.totalTrades
  };
}

/**
 * Calcula resumo geral
 */
function calculateSummary(accountPerformance: any) {
  const totalNetPnl = accountPerformance.owner.netPnl + 
                     accountPerformance.shadow.netPnl + 
                     accountPerformance.slave.netPnl;
  
  const totalTrades = accountPerformance.owner.totalTrades + 
                     accountPerformance.shadow.totalTrades + 
                     accountPerformance.slave.totalTrades;

  const totalWinning = accountPerformance.owner.winningTrades + 
                      accountPerformance.shadow.winningTrades + 
                      accountPerformance.slave.winningTrades;

  const totalClosed = accountPerformance.owner.closedTrades + 
                     accountPerformance.shadow.closedTrades + 
                     accountPerformance.slave.closedTrades;

  return {
    totalNetPnl,
    totalTrades,
    overallWinRate: totalClosed > 0 ? (totalWinning / totalClosed) * 100 : 0,
    bestPerformer: getBestPerformer(accountPerformance),
    worstPerformer: getWorstPerformer(accountPerformance)
  };
}

/**
 * Identifica melhor performer
 */
function getBestPerformer(accountPerformance: any) {
  const accounts = Object.entries(accountPerformance);
  return accounts.reduce((best, [name, stats]: [string, any]) => {
    return stats.netPnl > best.netPnl ? { name, netPnl: stats.netPnl } : best;
  }, { name: 'none', netPnl: -Infinity });
}

/**
 * Identifica pior performer
 */
function getWorstPerformer(accountPerformance: any) {
  const accounts = Object.entries(accountPerformance);
  return accounts.reduce((worst, [name, stats]: [string, any]) => {
    return stats.netPnl < worst.netPnl ? { name, netPnl: stats.netPnl } : worst;
  }, { name: 'none', netPnl: Infinity });
} 