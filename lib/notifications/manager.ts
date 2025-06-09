import { supabaseAdmin } from '@/lib/supabase/client';
import { NotificationQueue } from './queue';
import type { 
  Notification, 
  NotificationData, 
  NotificationType, 
  AccountType,
  ApiResponse 
} from '@/types/backend';

export class NotificationManager {
  private queue: NotificationQueue;

  constructor() {
    this.queue = new NotificationQueue();
  }

  /**
   * Cria uma nova notificação
   */
  async createNotification(params: {
    userId: string;
    tradeId: string;
    accountType: AccountType;
    notificationType: NotificationType;
    title: string;
    message: string;
    tradeData: NotificationData;
  }): Promise<ApiResponse<Notification>> {
    try {
      // Insere notificação no banco
      const { data: notification, error } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: params.userId,
          trade_id: params.tradeId,
          account_type: params.accountType,
          notification_type: params.notificationType,
          title: params.title,
          message: params.message,
          trade_data: params.tradeData,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Adiciona à fila de notificações não lidas
      await this.queue.addToQueue(params.userId, notification.id);

      // Envia notificação em tempo real via WebSocket
      await this.sendRealtimeNotification(params.userId, notification);

      return {
        success: true,
        data: notification,
        message: 'Notificação criada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar notificação'
      };
    }
  }

  /**
   * Lista notificações de um usuário
   */
  async getUserNotifications(
    userId: string, 
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      accountType?: AccountType;
    } = {}
  ): Promise<ApiResponse<Notification[]>> {
    try {
      let query = supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options.unreadOnly) {
        query = query.eq('is_read', false);
      }

      if (options.accountType) {
        query = query.eq('account_type', options.accountType);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data: notifications, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: notifications || [],
        message: `${notifications?.length || 0} notificações encontradas`
      };
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar notificações'
      };
    }
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(
    notificationId: string, 
    userId: string
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      // Remove da fila de notificações não lidas
      await this.queue.removeFromQueue(userId, notificationId);

      return {
        success: true,
        message: 'Notificação marcada como lida'
      };
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao marcar notificação como lida'
      };
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      // Limpa fila de notificações não lidas
      await this.queue.clearUserQueue(userId);

      return {
        success: true,
        message: 'Todas as notificações marcadas como lidas'
      };
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao marcar todas as notificações como lidas'
      };
    }
  }

  /**
   * Obtém contagem de notificações não lidas
   */
  async getUnreadCount(userId: string): Promise<ApiResponse<number>> {
    try {
      const { count, error } = await supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      return {
        success: true,
        data: count || 0,
        message: `${count || 0} notificações não lidas`
      };
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao contar notificações não lidas'
      };
    }
  }

  /**
   * Remove notificações antigas
   */
  async cleanupOldNotifications(daysToKeep: number = 30): Promise<ApiResponse<void>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await supabaseAdmin
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('is_read', true);

      if (error) throw error;

      return {
        success: true,
        message: `Notificações antigas removidas (mais de ${daysToKeep} dias)`
      };
    } catch (error) {
      console.error('Erro ao limpar notificações antigas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao limpar notificações antigas'
      };
    }
  }

  /**
   * Obtém estatísticas de notificações
   */
  async getNotificationStats(userId: string): Promise<ApiResponse<{
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
    byAccount: Record<AccountType, number>;
    recent: number; // últimas 24h
  }>> {
    try {
      const [totalResult, unreadResult, byTypeResult, byAccountResult, recentResult] = await Promise.all([
        // Total
        supabaseAdmin
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        
        // Não lidas
        supabaseAdmin
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false),
        
        // Por tipo
        supabaseAdmin
          .from('notifications')
          .select('notification_type')
          .eq('user_id', userId),
        
        // Por conta
        supabaseAdmin
          .from('notifications')
          .select('account_type')
          .eq('user_id', userId),
        
        // Recentes (24h)
        supabaseAdmin
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Processa estatísticas por tipo
      const byType: Record<NotificationType, number> = {
        trade_closed: 0,
        trade_opened: 0,
        error: 0,
        warning: 0
      };

      byTypeResult.data?.forEach(item => {
        byType[item.notification_type as NotificationType]++;
      });

      // Processa estatísticas por conta
      const byAccount: Record<AccountType, number> = {
        owner: 0,
        shadow: 0,
        slave: 0
      };

      byAccountResult.data?.forEach(item => {
        byAccount[item.account_type as AccountType]++;
      });

      return {
        success: true,
        data: {
          total: totalResult.count || 0,
          unread: unreadResult.count || 0,
          byType,
          byAccount,
          recent: recentResult.count || 0
        },
        message: 'Estatísticas obtidas com sucesso'
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter estatísticas'
      };
    }
  }

  /**
   * Envia notificação em tempo real via WebSocket
   */
  private async sendRealtimeNotification(userId: string, notification: any): Promise<void> {
    try {
      // Importa dinamicamente para evitar problemas de inicialização
      const { notificationWebSocketServer } = await import('./websocket');
      
      // Envia notificação via WebSocket
      const sent = notificationWebSocketServer.sendNotificationToUser(userId, {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.notification_type,
        accountType: notification.account_type,
        tradeData: notification.trade_data,
        createdAt: notification.created_at
      });
      
      if (sent) {
        console.log(`Notificação em tempo real enviada para usuário ${userId}: ${notification.title}`);
      } else {
        console.log(`Usuário ${userId} não está conectado via WebSocket`);
      }
    } catch (error) {
      console.error('Erro ao enviar notificação em tempo real:', error);
    }
  }

  /**
   * Cria notificação de trade fechado com dados formatados
   */
  async createTradeClosedNotification(
    userId: string,
    tradeId: string,
    accountType: AccountType,
    tradeData: {
      quantity: number;
      margin: number;
      pl: number;
      opening_fee: number;
      closing_fee: number;
      closed_ts?: number;
    }
  ): Promise<ApiResponse<Notification>> {
    const totalFees = tradeData.opening_fee + tradeData.closing_fee;
    const netPL = tradeData.pl - totalFees;
    const isProfit = netPL >= 0;

    const notificationData: NotificationData = {
      quantity: tradeData.quantity,
      tradeMargin: tradeData.margin,
      fees: totalFees,
      pl: tradeData.pl,
      netPL,
      accountType,
      tradeId,
      closedAt: new Date(tradeData.closed_ts || Date.now())
    };

    return this.createNotification({
      userId,
      tradeId,
      accountType,
      notificationType: 'trade_closed',
      title: `Trade ${accountType.toUpperCase()} Fechado`,
      message: `Trade fechado com ${isProfit ? 'lucro' : 'prejuízo'} de $${Math.abs(netPL).toFixed(2)}`,
      tradeData: notificationData
    });
  }
} 