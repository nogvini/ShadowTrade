import { supabaseAdmin } from '@/lib/supabase/client';
import type { ApiResponse } from '@/types/backend';

export class NotificationQueue {
  /**
   * Adiciona notificação à fila de não lidas
   */
  async addToQueue(
    userId: string, 
    notificationId: string, 
    priority: number = 1
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabaseAdmin
        .from('notification_queue')
        .insert({
          user_id: userId,
          notification_id: notificationId,
          priority,
          retry_count: 0,
          scheduled_for: new Date().toISOString()
        });

      if (error) throw error;

      return {
        success: true,
        message: 'Notificação adicionada à fila'
      };
    } catch (error) {
      console.error('Erro ao adicionar à fila:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao adicionar à fila'
      };
    }
  }

  /**
   * Remove notificação da fila (quando marcada como lida)
   */
  async removeFromQueue(
    userId: string, 
    notificationId: string
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabaseAdmin
        .from('notification_queue')
        .delete()
        .eq('user_id', userId)
        .eq('notification_id', notificationId);

      if (error) throw error;

      return {
        success: true,
        message: 'Notificação removida da fila'
      };
    } catch (error) {
      console.error('Erro ao remover da fila:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao remover da fila'
      };
    }
  }

  /**
   * Limpa toda a fila de um usuário
   */
  async clearUserQueue(userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabaseAdmin
        .from('notification_queue')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return {
        success: true,
        message: 'Fila do usuário limpa'
      };
    } catch (error) {
      console.error('Erro ao limpar fila do usuário:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao limpar fila do usuário'
      };
    }
  }

  /**
   * Obtém notificações pendentes na fila
   */
  async getPendingNotifications(
    userId: string, 
    limit: number = 50
  ): Promise<ApiResponse<any[]>> {
    try {
      const { data: queueItems, error } = await supabaseAdmin
        .from('notification_queue')
        .select(`
          *,
          notifications (*)
        `)
        .eq('user_id', userId)
        .order('priority', { ascending: false })
        .order('scheduled_for', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        data: queueItems || [],
        message: `${queueItems?.length || 0} notificações pendentes`
      };
    } catch (error) {
      console.error('Erro ao obter notificações pendentes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter notificações pendentes'
      };
    }
  }

  /**
   * Atualiza prioridade de uma notificação na fila
   */
  async updatePriority(
    userId: string, 
    notificationId: string, 
    newPriority: number
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabaseAdmin
        .from('notification_queue')
        .update({ priority: newPriority })
        .eq('user_id', userId)
        .eq('notification_id', notificationId);

      if (error) throw error;

      return {
        success: true,
        message: 'Prioridade atualizada'
      };
    } catch (error) {
      console.error('Erro ao atualizar prioridade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar prioridade'
      };
    }
  }

  /**
   * Incrementa contador de retry para notificação
   */
  async incrementRetryCount(
    userId: string, 
    notificationId: string
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabaseAdmin
        .rpc('increment_retry_count', {
          p_user_id: userId,
          p_notification_id: notificationId
        });

      if (error) throw error;

      return {
        success: true,
        message: 'Contador de retry incrementado'
      };
    } catch (error) {
      console.error('Erro ao incrementar retry:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao incrementar retry'
      };
    }
  }

  /**
   * Remove notificações com muitos retries
   */
  async cleanupFailedNotifications(maxRetries: number = 5): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabaseAdmin
        .from('notification_queue')
        .delete()
        .gte('retry_count', maxRetries);

      if (error) throw error;

      return {
        success: true,
        message: 'Notificações com falha removidas'
      };
    } catch (error) {
      console.error('Erro ao limpar notificações com falha:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao limpar notificações com falha'
      };
    }
  }

  /**
   * Obtém estatísticas da fila
   */
  async getQueueStats(userId?: string): Promise<ApiResponse<{
    totalPending: number;
    highPriority: number;
    withRetries: number;
    oldestPending: Date | null;
  }>> {
    try {
      let baseQuery = supabaseAdmin.from('notification_queue');
      
      if (userId) {
        baseQuery = baseQuery.eq('user_id', userId);
      }

      const [totalResult, highPriorityResult, retriesResult, oldestResult] = await Promise.all([
        // Total pendente
        baseQuery.select('*', { count: 'exact', head: true }),
        
        // Alta prioridade
        baseQuery.select('*', { count: 'exact', head: true }).gte('priority', 3),
        
        // Com retries
        baseQuery.select('*', { count: 'exact', head: true }).gt('retry_count', 0),
        
        // Mais antiga
        baseQuery.select('scheduled_for').order('scheduled_for', { ascending: true }).limit(1)
      ]);

      const oldestPending = oldestResult.data?.[0]?.scheduled_for 
        ? new Date(oldestResult.data[0].scheduled_for) 
        : null;

      return {
        success: true,
        data: {
          totalPending: totalResult.count || 0,
          highPriority: highPriorityResult.count || 0,
          withRetries: retriesResult.count || 0,
          oldestPending
        },
        message: 'Estatísticas da fila obtidas'
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas da fila:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter estatísticas da fila'
      };
    }
  }

  /**
   * Reagenda notificação para processamento posterior
   */
  async rescheduleNotification(
    userId: string, 
    notificationId: string, 
    delayMinutes: number = 5
  ): Promise<ApiResponse<void>> {
    try {
      const newScheduledTime = new Date();
      newScheduledTime.setMinutes(newScheduledTime.getMinutes() + delayMinutes);

      const { error } = await supabaseAdmin
        .from('notification_queue')
        .update({ 
          scheduled_for: newScheduledTime.toISOString(),
          retry_count: supabaseAdmin.rpc('increment', { current_value: 'retry_count' })
        })
        .eq('user_id', userId)
        .eq('notification_id', notificationId);

      if (error) throw error;

      return {
        success: true,
        message: `Notificação reagendada para ${delayMinutes} minutos`
      };
    } catch (error) {
      console.error('Erro ao reagendar notificação:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao reagendar notificação'
      };
    }
  }
} 