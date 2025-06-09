import { NextRequest, NextResponse } from 'next/server';
import { autoCloseManager } from '@/lib/lnmarkets/auto-close';

export async function GET(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação aqui
    // const userId = await getUserFromRequest(request);
    const userId = 'temp-user-id'; // Temporário para desenvolvimento

    const { searchParams } = new URL(request.url);
    const userFilter = searchParams.get('user_filter') === 'true';

    // Obtém estatísticas de fechamento automático
    const stats = autoCloseManager.getAutoCloseStats(
      userFilter ? userId : undefined
    );

    // Obtém logs recentes para análise adicional
    const recentLogs = autoCloseManager.getAutoCloseLogs(
      userFilter ? userId : undefined,
      10
    );

    // Calcula estatísticas adicionais
    const last24Hours = recentLogs.filter(
      log => log.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const accountTypeStats = recentLogs.reduce((acc, log) => {
      const key = `${log.triggerAccountType}_to_${log.targetAccountType}`;
      if (!acc[key]) {
        acc[key] = { closed: 0, skipped: 0, failed: 0 };
      }
      acc[key][log.action]++;
      return acc;
    }, {} as Record<string, { closed: number; skipped: number; failed: number }>);

    return NextResponse.json({
      success: true,
      data: {
        overall: stats,
        last24Hours: {
          total: last24Hours.length,
          closed: last24Hours.filter(log => log.action === 'closed').length,
          skipped: last24Hours.filter(log => log.action === 'skipped').length,
          failed: last24Hours.filter(log => log.action === 'failed').length
        },
        byAccountType: accountTypeStats,
        recentActivity: recentLogs.slice(0, 5).map(log => ({
          timestamp: log.timestamp,
          action: log.action,
          trigger: `${log.triggerAccountType}:${log.triggerTradeId}`,
          target: `${log.targetAccountType}:${log.targetTradeId}`,
          reason: log.reason
        }))
      },
      message: 'Estatísticas de fechamento automático obtidas com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao obter estatísticas de fechamento automático:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 