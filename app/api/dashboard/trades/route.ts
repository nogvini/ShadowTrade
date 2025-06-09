import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação aqui
    // const userId = await getUserFromRequest(request);
    const userId = 'temp-user-id'; // Temporário para desenvolvimento

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // 'open' | 'closed' | null
    const accountType = searchParams.get('account_type'); // 'owner' | 'shadow' | 'slave' | null
    const period = searchParams.get('period') || '7d'; // '1d' | '7d' | '30d' | 'all'

    // Calcula data de início baseada no período
    const startDate = getStartDateForPeriod(period);

    // Constrói query
    let query = supabaseAdmin
      .from('trade_monitoring')
      .select(`
        id,
        trade_id,
        account_type,
        status,
        trade_data,
        created_at,
        last_checked
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Aplica filtros
    if (status) {
      query = query.eq('status', status);
    }

    if (accountType) {
      query = query.eq('account_type', accountType);
    }

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data: trades, error, count } = await query;

    if (error) throw error;

    // Processa dados dos trades
    const processedTrades = trades?.map(trade => {
      const tradeData = trade.trade_data || {};
      
      return {
        id: trade.id,
        tradeId: trade.trade_id,
        accountType: trade.account_type,
        status: trade.status,
        quantity: tradeData.quantity || 0,
        margin: tradeData.margin || 0,
        pnl: tradeData.pl || 0,
        fees: (tradeData.opening_fee || 0) + (tradeData.closing_fee || 0),
        netPnl: (tradeData.pl || 0) - ((tradeData.opening_fee || 0) + (tradeData.closing_fee || 0)),
        openedAt: trade.created_at,
        closedAt: tradeData.closed_ts || null,
        lastChecked: trade.last_checked,
        side: tradeData.side || 'unknown',
        leverage: tradeData.leverage || 1,
        entryPrice: tradeData.price || 0,
        exitPrice: tradeData.exit_price || null
      };
    }) || [];

    // Calcula estatísticas do período
    const stats = calculateTradeStats(processedTrades);

    return NextResponse.json({
      success: true,
      data: {
        trades: processedTrades,
        pagination: {
          limit,
          offset,
          total: count || 0,
          hasMore: (count || 0) > offset + limit
        },
        filters: {
          status,
          accountType,
          period,
          startDate
        },
        stats
      },
      message: 'Histórico de trades obtido com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao obter histórico de trades:', error);
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
    case 'all':
    default:
      return null;
  }
}

/**
 * Calcula estatísticas dos trades
 */
function calculateTradeStats(trades: any[]) {
  const stats = {
    total: trades.length,
    open: 0,
    closed: 0,
    profitable: 0,
    unprofitable: 0,
    totalPnl: 0,
    totalFees: 0,
    totalNetPnl: 0,
    averagePnl: 0,
    winRate: 0,
    byAccountType: {
      owner: { count: 0, pnl: 0, netPnl: 0 },
      shadow: { count: 0, pnl: 0, netPnl: 0 },
      slave: { count: 0, pnl: 0, netPnl: 0 }
    },
    bySide: {
      buy: { count: 0, pnl: 0 },
      sell: { count: 0, pnl: 0 }
    }
  };

  trades.forEach(trade => {
    // Status
    if (trade.status === 'open') stats.open++;
    else if (trade.status === 'closed') stats.closed++;

    // P&L
    stats.totalPnl += trade.pnl;
    stats.totalFees += trade.fees;
    stats.totalNetPnl += trade.netPnl;

    // Profitable/Unprofitable
    if (trade.netPnl > 0) stats.profitable++;
    else if (trade.netPnl < 0) stats.unprofitable++;

    // Por tipo de conta
    if (stats.byAccountType[trade.accountType as keyof typeof stats.byAccountType]) {
      stats.byAccountType[trade.accountType as keyof typeof stats.byAccountType].count++;
      stats.byAccountType[trade.accountType as keyof typeof stats.byAccountType].pnl += trade.pnl;
      stats.byAccountType[trade.accountType as keyof typeof stats.byAccountType].netPnl += trade.netPnl;
    }

    // Por lado
    if (trade.side === 'buy' || trade.side === 'sell') {
      stats.bySide[trade.side].count++;
      stats.bySide[trade.side].pnl += trade.pnl;
    }
  });

  // Calcula médias
  if (stats.total > 0) {
    stats.averagePnl = stats.totalPnl / stats.total;
    stats.winRate = (stats.profitable / stats.total) * 100;
  }

  return stats;
} 