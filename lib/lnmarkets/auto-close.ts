import { LNMarketsClient } from './client';
import { supabaseAdmin } from '@/lib/supabase/client';
import { decryptCredentials } from '@/lib/crypto/encryption';
import { NotificationManager } from '@/lib/notifications/manager';
import type { AccountType, LNMarketsTrade } from '@/types/backend';

interface AutoCloseRule {
  triggerAccount: AccountType;
  targetAccount: AccountType;
  condition: 'always' | 'conditional';
  conditionField?: string;
}

interface AutoCloseLog {
  id: string;
  userId: string;
  triggerTradeId: string;
  triggerAccountType: AccountType;
  targetTradeId: string;
  targetAccountType: AccountType;
  action: 'closed' | 'skipped' | 'failed';
  reason: string;
  timestamp: Date;
  error?: string;
}

export class AutoCloseManager {
  private notificationManager: NotificationManager;
  private logs: AutoCloseLog[] = [];

  // Regras de fechamento automático
  private readonly CLOSE_RULES: AutoCloseRule[] = [
    {
      triggerAccount: 'owner',
      targetAccount: 'shadow',
      condition: 'conditional',
      conditionField: 'shadow_close'
    },
    {
      triggerAccount: 'owner',
      targetAccount: 'slave',
      condition: 'always'
    },
    {
      triggerAccount: 'shadow',
      targetAccount: 'slave',
      condition: 'always'
    }
  ];

  constructor() {
    this.notificationManager = new NotificationManager();
  }

  /**
   * Processa fechamento automático quando um trade é fechado
   */
  async processTradeClose(
    userId: string,
    accountType: AccountType,
    tradeId: string,
    tradeData: LNMarketsTrade
  ): Promise<void> {
    console.log(`🔄 Iniciando fechamento automático para trade ${tradeId} (${accountType})`);

    try {
      // Obtém associações relevantes
      const associations = await this.getRelevantAssociations(userId, accountType, tradeId);

      if (associations.length === 0) {
        console.log(`ℹ️ Nenhuma associação encontrada para trade ${tradeId}`);
        return;
      }

      // Processa cada associação
      for (const association of associations) {
        await this.processAssociation(userId, accountType, tradeId, association, tradeData);
      }

      // Envia notificação de resumo se houve fechamentos
      await this.sendClosingSummary(userId, accountType, tradeId);

    } catch (error) {
      console.error(`❌ Erro no fechamento automático para trade ${tradeId}:`, error);
      
      // Log do erro
      this.addLog({
        id: this.generateLogId(),
        userId,
        triggerTradeId: tradeId,
        triggerAccountType: accountType,
        targetTradeId: 'unknown',
        targetAccountType: 'unknown' as AccountType,
        action: 'failed',
        reason: 'Erro no processamento',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obtém associações relevantes para o fechamento
   */
  private async getRelevantAssociations(
    userId: string,
    accountType: AccountType,
    tradeId: string
  ): Promise<any[]> {
    let query = supabaseAdmin
      .from('account_associations')
      .select('*')
      .eq('user_id', userId);

    // Filtra por tipo de conta
    switch (accountType) {
      case 'owner':
        query = query.eq('owner_trade_id', tradeId);
        break;
      case 'shadow':
        query = query.eq('shadow_trade_id', tradeId);
        break;
      case 'slave':
        // Slave não fecha outros trades
        return [];
    }

    const { data: associations, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar associações: ${error.message}`);
    }

    return associations || [];
  }

  /**
   * Processa uma associação específica
   */
  private async processAssociation(
    userId: string,
    triggerAccountType: AccountType,
    triggerTradeId: string,
    association: any,
    triggerTradeData: LNMarketsTrade
  ): Promise<void> {
    // Determina quais trades devem ser fechados
    const tradesToClose = this.getTradestoClose(triggerAccountType, association);

    for (const { accountType, tradeId } of tradesToClose) {
      await this.attemptTradeClose(
        userId,
        triggerAccountType,
        triggerTradeId,
        accountType,
        tradeId,
        association,
        triggerTradeData
      );
    }
  }

  /**
   * Determina quais trades devem ser fechados baseado nas regras
   */
  private getTradestoClose(
    triggerAccountType: AccountType,
    association: any
  ): Array<{ accountType: AccountType; tradeId: string }> {
    const tradesToClose: Array<{ accountType: AccountType; tradeId: string }> = [];

    if (triggerAccountType === 'owner') {
      // Owner fechado - verifica Shadow e Slave
      if (association.shadow_trade_id) {
        tradesToClose.push({
          accountType: 'shadow',
          tradeId: association.shadow_trade_id
        });
      }
      if (association.slave_trade_id) {
        tradesToClose.push({
          accountType: 'slave',
          tradeId: association.slave_trade_id
        });
      }
    } else if (triggerAccountType === 'shadow') {
      // Shadow fechado - fecha apenas Slave
      if (association.slave_trade_id) {
        tradesToClose.push({
          accountType: 'slave',
          tradeId: association.slave_trade_id
        });
      }
    }

    return tradesToClose;
  }

  /**
   * Tenta fechar um trade específico
   */
  private async attemptTradeClose(
    userId: string,
    triggerAccountType: AccountType,
    triggerTradeId: string,
    targetAccountType: AccountType,
    targetTradeId: string,
    association: any,
    triggerTradeData: LNMarketsTrade
  ): Promise<void> {
    const logId = this.generateLogId();

    try {
      // Verifica se deve fechar baseado nas regras
      const shouldClose = await this.shouldCloseTarget(
        userId,
        triggerAccountType,
        targetAccountType,
        association
      );

      if (!shouldClose.should) {
        console.log(`⏭️ Pulando fechamento de ${targetAccountType} trade ${targetTradeId}: ${shouldClose.reason}`);
        
        this.addLog({
          id: logId,
          userId,
          triggerTradeId,
          triggerAccountType,
          targetTradeId,
          targetAccountType,
          action: 'skipped',
          reason: shouldClose.reason,
          timestamp: new Date()
        });
        return;
      }

      // Obtém configuração da conta alvo
      const { data: targetAccount } = await supabaseAdmin
        .from('encrypted_apis')
        .select('*')
        .eq('user_id', userId)
        .eq('account_type', targetAccountType)
        .single();

      if (!targetAccount) {
        throw new Error(`Conta ${targetAccountType} não encontrada`);
      }

      // Verifica se o trade ainda está aberto
      const isTradeOpen = await this.isTradeOpen(targetAccount, targetTradeId);
      if (!isTradeOpen) {
        console.log(`ℹ️ Trade ${targetTradeId} já está fechado`);
        
        this.addLog({
          id: logId,
          userId,
          triggerTradeId,
          triggerAccountType,
          targetTradeId,
          targetAccountType,
          action: 'skipped',
          reason: 'Trade já fechado',
          timestamp: new Date()
        });
        return;
      }

      // Fecha o trade
      const closeResult = await this.executeTradeClose(targetAccount, targetTradeId);

      if (closeResult.success) {
        console.log(`✅ Trade ${targetTradeId} (${targetAccountType}) fechado automaticamente`);
        
        this.addLog({
          id: logId,
          userId,
          triggerTradeId,
          triggerAccountType,
          targetTradeId,
          targetAccountType,
          action: 'closed',
          reason: `Fechado automaticamente após ${triggerAccountType} trade ${triggerTradeId}`,
          timestamp: new Date()
        });

        // Cria notificação de fechamento automático
        await this.createAutoCloseNotification(
          userId,
          triggerAccountType,
          triggerTradeId,
          targetAccountType,
          targetTradeId,
          triggerTradeData,
          closeResult.tradeData
        );

        // Envia atualização via WebSocket
        await this.sendWebSocketUpdate(
          userId,
          triggerAccountType,
          targetAccountType,
          targetTradeId,
          closeResult.tradeData
        );

      } else {
        throw new Error(closeResult.error || 'Erro desconhecido ao fechar trade');
      }

    } catch (error) {
      console.error(`❌ Erro ao fechar trade ${targetTradeId} (${targetAccountType}):`, error);
      
      this.addLog({
        id: logId,
        userId,
        triggerTradeId,
        triggerAccountType,
        targetTradeId,
        targetAccountType,
        action: 'failed',
        reason: 'Erro na execução',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });

      // Cria notificação de erro
      await this.notificationManager.createNotification({
        userId,
        tradeId: targetTradeId,
        accountType: targetAccountType,
        notificationType: 'error',
        title: 'Erro no Fechamento Automático',
        message: `Erro ao fechar trade ${targetAccountType} automaticamente`,
        tradeData: {
          quantity: 0,
          tradeMargin: 0,
          fees: 0,
          pl: 0,
          netPL: 0,
          accountType: targetAccountType,
          tradeId: targetTradeId,
          closedAt: new Date()
        }
      });
    }
  }

  /**
   * Verifica se um trade deve ser fechado baseado nas regras
   */
  private async shouldCloseTarget(
    userId: string,
    triggerAccountType: AccountType,
    targetAccountType: AccountType,
    association: any
  ): Promise<{ should: boolean; reason: string }> {
    // Encontra a regra aplicável
    const rule = this.CLOSE_RULES.find(
      r => r.triggerAccount === triggerAccountType && r.targetAccount === targetAccountType
    );

    if (!rule) {
      return { should: false, reason: 'Nenhuma regra aplicável' };
    }

    if (rule.condition === 'always') {
      return { should: true, reason: 'Fechamento obrigatório' };
    }

    if (rule.condition === 'conditional' && rule.conditionField) {
      // Verifica condição específica
      if (rule.conditionField === 'shadow_close') {
        const { data: shadowAccount } = await supabaseAdmin
          .from('encrypted_apis')
          .select('shadow_close')
          .eq('user_id', userId)
          .eq('account_type', 'shadow')
          .single();

        if (!shadowAccount?.shadow_close) {
          return { should: false, reason: 'Shadow close desabilitado' };
        }
      }

      return { should: true, reason: 'Condição atendida' };
    }

    return { should: false, reason: 'Condição não definida' };
  }

  /**
   * Verifica se um trade ainda está aberto
   */
  private async isTradeOpen(account: any, tradeId: string): Promise<boolean> {
    try {
      const credentials = decryptCredentials(
        JSON.parse(account.encrypted_api_key),
        JSON.parse(account.encrypted_api_secret),
        JSON.parse(account.encrypted_passphrase)
      );

      const client = new LNMarketsClient(credentials);
      const openTrades = await client.getOpenTrades();

      return openTrades.some(trade => trade.id === tradeId);
    } catch (error) {
      console.error('Erro ao verificar se trade está aberto:', error);
      return false;
    }
  }

  /**
   * Executa o fechamento de um trade
   */
  private async executeTradeClose(account: any, tradeId: string): Promise<{
    success: boolean;
    error?: string;
    tradeData?: LNMarketsTrade;
  }> {
    try {
      const credentials = decryptCredentials(
        JSON.parse(account.encrypted_api_key),
        JSON.parse(account.encrypted_api_secret),
        JSON.parse(account.encrypted_passphrase)
      );

      const client = new LNMarketsClient(credentials);
      
      // Obtém dados do trade antes de fechar
      const openTrades = await client.getOpenTrades();
      const tradeData = openTrades.find(trade => trade.id === tradeId);

      // Fecha o trade
      const result = await client.closeTrade(tradeId);

      return {
        success: result.success,
        error: result.error,
        tradeData
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria notificação de fechamento automático
   */
  private async createAutoCloseNotification(
    userId: string,
    triggerAccountType: AccountType,
    triggerTradeId: string,
    targetAccountType: AccountType,
    targetTradeId: string,
    triggerTradeData: LNMarketsTrade,
    targetTradeData?: LNMarketsTrade
  ): Promise<void> {
    const title = `${targetAccountType.toUpperCase()} Fechado Automaticamente`;
    const message = `Trade ${targetAccountType} fechado seguindo ${triggerAccountType} trade ${triggerTradeId}`;

    await this.notificationManager.createNotification({
      userId,
      tradeId: targetTradeId,
      accountType: targetAccountType,
      notificationType: 'trade_closed',
      title,
      message,
      tradeData: {
        quantity: targetTradeData?.quantity || 0,
        tradeMargin: targetTradeData?.margin || 0,
        fees: (targetTradeData?.opening_fee || 0) + (targetTradeData?.closing_fee || 0),
        pl: targetTradeData?.pl || 0,
        netPL: (targetTradeData?.pl || 0) - ((targetTradeData?.opening_fee || 0) + (targetTradeData?.closing_fee || 0)),
        accountType: targetAccountType,
        tradeId: targetTradeId,
        closedAt: new Date(),
        autoClose: true,
        triggerTrade: {
          id: triggerTradeId,
          accountType: triggerAccountType
        }
      }
    });
  }

  /**
   * Envia atualização via WebSocket
   */
  private async sendWebSocketUpdate(
    userId: string,
    triggerAccountType: AccountType,
    targetAccountType: AccountType,
    targetTradeId: string,
    targetTradeData?: LNMarketsTrade
  ): Promise<void> {
    try {
      const { notificationWebSocketServer } = await import('@/lib/notifications/websocket');
      
      notificationWebSocketServer.sendNotificationToUser(userId, {
        id: `auto_close_${targetTradeId}`,
        title: 'Fechamento Automático',
        message: `Trade ${targetAccountType} fechado automaticamente`,
        type: 'trade_closed',
        accountType: targetAccountType,
        tradeData: {
          quantity: targetTradeData?.quantity || 0,
          netPnl: (targetTradeData?.pl || 0) - ((targetTradeData?.opening_fee || 0) + (targetTradeData?.closing_fee || 0)),
          autoClose: true
        },
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao enviar atualização WebSocket:', error);
    }
  }

  /**
   * Envia notificação de resumo dos fechamentos
   */
  private async sendClosingSummary(
    userId: string,
    triggerAccountType: AccountType,
    triggerTradeId: string
  ): Promise<void> {
    const recentLogs = this.logs.filter(
      log => log.userId === userId && 
             log.triggerTradeId === triggerTradeId &&
             log.timestamp > new Date(Date.now() - 60000) // Últimos 60 segundos
    );

    const closedCount = recentLogs.filter(log => log.action === 'closed').length;
    const skippedCount = recentLogs.filter(log => log.action === 'skipped').length;
    const failedCount = recentLogs.filter(log => log.action === 'failed').length;

    if (closedCount > 0 || failedCount > 0) {
      const title = 'Resumo do Fechamento Automático';
      const message = `${closedCount} trades fechados, ${skippedCount} pulados, ${failedCount} falharam`;

      await this.notificationManager.createNotification({
        userId,
        tradeId: triggerTradeId,
        accountType: triggerAccountType,
        notificationType: 'info',
        title,
        message,
        tradeData: {
          quantity: 0,
          tradeMargin: 0,
          fees: 0,
          pl: 0,
          netPL: 0,
          accountType: triggerAccountType,
          tradeId: triggerTradeId,
          closedAt: new Date(),
          summary: {
            closed: closedCount,
            skipped: skippedCount,
            failed: failedCount
          }
        }
      });
    }
  }

  /**
   * Adiciona log de fechamento automático
   */
  private addLog(log: AutoCloseLog): void {
    this.logs.push(log);
    
    // Mantém apenas os últimos 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  /**
   * Gera ID único para log
   */
  private generateLogId(): string {
    return `auto_close_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtém logs de fechamento automático
   */
  getAutoCloseLogs(userId?: string, limit: number = 100): AutoCloseLog[] {
    let filteredLogs = this.logs;

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }

    return filteredLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Obtém estatísticas de fechamento automático
   */
  getAutoCloseStats(userId?: string): {
    total: number;
    closed: number;
    skipped: number;
    failed: number;
    successRate: number;
  } {
    let filteredLogs = this.logs;

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }

    const total = filteredLogs.length;
    const closed = filteredLogs.filter(log => log.action === 'closed').length;
    const skipped = filteredLogs.filter(log => log.action === 'skipped').length;
    const failed = filteredLogs.filter(log => log.action === 'failed').length;
    const successRate = total > 0 ? (closed / (closed + failed)) * 100 : 0;

    return {
      total,
      closed,
      skipped,
      failed,
      successRate: Math.round(successRate * 100) / 100
    };
  }
}

// Instância singleton do gerenciador de fechamento automático
export const autoCloseManager = new AutoCloseManager(); 