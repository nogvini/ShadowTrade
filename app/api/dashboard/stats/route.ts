import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { autoCloseManager } from '@/lib/lnmarkets/auto-close';
import { tradeMonitor } from '@/lib/lnmarkets/monitor';

export async function GET(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação aqui
    // const userId = await getUserFromRequest(request);
    const userId = 'temp-user-id'; // Temporário para desenvolvimento

    // Busca dados em paralelo
    const [
      accountsData,
      associationsData,
      notificationsData,
      monitoringData
    ] = await Promise.all([
      getAccountsStats(userId),
      getAssociationsStats(userId),
      getNotificationsStats(userId),
      getMonitoringStats()
    ]);

    // Obtém estatísticas de fechamento automático
    const autoCloseStats = autoCloseManager.getAutoCloseStats(userId);

    // Calcula métricas gerais
    const totalAccounts = accountsData.owner + accountsData.shadow + accountsData.slave;
    const activeAssociations = associationsData.total;
    const unreadNotifications = notificationsData.unread;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalAccounts,
          activeAssociations,
          unreadNotifications,
          monitoringActive: monitoringData.isActive,
          autoCloseSuccessRate: autoCloseStats.successRate
        },
        accounts: accountsData,
        associations: associationsData,
        notifications: notificationsData,
        monitoring: monitoringData,
        autoClose: autoCloseStats,
        lastUpdated: new Date()
      },
      message: 'Estatísticas do dashboard obtidas com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao obter estatísticas do dashboard:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

/**
 * Obtém estatísticas das contas
 */
async function getAccountsStats(userId: string) {
  try {
    const { data: accounts, error } = await supabaseAdmin
      .from('encrypted_apis')
      .select('account_type, is_active, created_at')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      owner: 0,
      shadow: 0,
      slave: 0,
      total: accounts?.length || 0,
      active: accounts?.filter(a => a.is_active).length || 0,
      inactive: accounts?.filter(a => !a.is_active).length || 0
    };

    accounts?.forEach(account => {
      if (account.account_type === 'owner') stats.owner++;
      else if (account.account_type === 'shadow') stats.shadow++;
      else if (account.account_type === 'slave') stats.slave++;
    });

    return stats;
  } catch (error) {
    console.error('Erro ao obter estatísticas de contas:', error);
    return { owner: 0, shadow: 0, slave: 0, total: 0, active: 0, inactive: 0 };
  }
}

/**
 * Obtém estatísticas das associações
 */
async function getAssociationsStats(userId: string) {
  try {
    const { data: associations, error } = await supabaseAdmin
      .from('account_associations')
      .select('association_type, created_at')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: associations?.length || 0,
      shadowToOwner: 0,
      slaveToShadow: 0,
      slaveToOwner: 0,
      last24Hours: 0
    };

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    associations?.forEach(association => {
      // Conta por tipo
      if (association.association_type === 'shadow_to_owner') stats.shadowToOwner++;
      else if (association.association_type === 'slave_to_shadow') stats.slaveToShadow++;
      else if (association.association_type === 'slave_to_owner') stats.slaveToOwner++;

      // Conta últimas 24h
      if (new Date(association.created_at) > last24Hours) {
        stats.last24Hours++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Erro ao obter estatísticas de associações:', error);
    return { total: 0, shadowToOwner: 0, slaveToShadow: 0, slaveToOwner: 0, last24Hours: 0 };
  }
}

/**
 * Obtém estatísticas das notificações
 */
async function getNotificationsStats(userId: string) {
  try {
    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('notification_type, is_read, created_at')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: notifications?.length || 0,
      unread: notifications?.filter(n => !n.is_read).length || 0,
      read: notifications?.filter(n => n.is_read).length || 0,
      last24Hours: 0,
      byType: {
        trade_opened: 0,
        trade_closed: 0,
        warning: 0,
        error: 0,
        info: 0
      }
    };

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    notifications?.forEach(notification => {
      // Conta por tipo
      if (stats.byType.hasOwnProperty(notification.notification_type)) {
        stats.byType[notification.notification_type as keyof typeof stats.byType]++;
      }

      // Conta últimas 24h
      if (new Date(notification.created_at) > last24Hours) {
        stats.last24Hours++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Erro ao obter estatísticas de notificações:', error);
    return { 
      total: 0, 
      unread: 0, 
      read: 0, 
      last24Hours: 0,
      byType: { trade_opened: 0, trade_closed: 0, warning: 0, error: 0, info: 0 }
    };
  }
}

/**
 * Obtém estatísticas do monitoramento
 */
async function getMonitoringStats() {
  try {
    const monitoringStatus = await tradeMonitor.getMonitoringStatus();
    
    // Obtém dados de trades monitorados
    const { data: trades, error } = await supabaseAdmin
      .from('trade_monitoring')
      .select('status, created_at, last_checked');

    if (error) throw error;

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tradesLast24h = trades?.filter(t => 
      new Date(t.created_at) > last24Hours
    ).length || 0;

    return {
      ...monitoringStatus,
      tradesLast24h,
      totalTrades: trades?.length || 0
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas de monitoramento:', error);
    return {
      isActive: false,
      lastCheck: new Date(),
      activeAccounts: { owner: false, shadow: false, slave: false },
      tradesCount: { open: 0, closed: 0, total: 0 },
      tradesLast24h: 0,
      totalTrades: 0
    };
  }
} 