import { LNMarketsClient } from './client';
import { supabaseAdmin } from '@/lib/supabase/client';
import { decryptCredentials } from '@/lib/crypto/encryption';
import { NotificationManager } from '@/lib/notifications/manager';
import type { 
  AccountType, 
  LNMarketsTrade, 
  TradeMonitoring, 
  EncryptedData,
  MonitoringStatus 
} from '@/types/backend';

export class TradeMonitor {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private notificationManager: NotificationManager;
  private readonly MONITORING_INTERVAL = 5 * 60 * 1000; // 5 minutos

  constructor() {
    this.notificationManager = new NotificationManager();
  }

  /**
   * Inicia o monitoramento de trades
   */
  async startMonitoring(): Promise<{ success: boolean; message: string }> {
    if (this.isRunning) {
      return { success: false, message: 'Monitoramento já está ativo' };
    }

    try {
      this.isRunning = true;
      
      // Executa primeira verificação imediatamente
      await this.checkAllUserTrades();
      
      // Configura intervalo de monitoramento
      this.intervalId = setInterval(async () => {
        try {
          await this.checkAllUserTrades();
        } catch (error) {
          console.error('Erro no monitoramento:', error);
        }
      }, this.MONITORING_INTERVAL);

      return { success: true, message: 'Monitoramento iniciado com sucesso' };
    } catch (error) {
      this.isRunning = false;
      return { 
        success: false, 
        message: `Erro ao iniciar monitoramento: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      };
    }
  }

  /**
   * Para o monitoramento de trades
   */
  stopMonitoring(): { success: boolean; message: string } {
    if (!this.isRunning) {
      return { success: false, message: 'Monitoramento não está ativo' };
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    return { success: true, message: 'Monitoramento parado com sucesso' };
  }

  /**
   * Verifica trades de todos os usuários
   */
  private async checkAllUserTrades(): Promise<void> {
    try {
      // Obtém todas as contas ativas
      const { data: accounts, error } = await supabaseAdmin
        .from('encrypted_apis')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Processa cada conta
      for (const account of accounts || []) {
        await this.checkUserAccountTrades(account);
      }

      console.log(`Monitoramento executado para ${accounts?.length || 0} contas`);
    } catch (error) {
      console.error('Erro ao verificar trades de usuários:', error);
    }
  }

  /**
   * Verifica trades de uma conta específica
   */
  private async checkUserAccountTrades(account: any): Promise<void> {
    try {
      // Descriptografa credenciais
      const credentials = decryptCredentials(
        JSON.parse(account.encrypted_api_key),
        JSON.parse(account.encrypted_api_secret),
        JSON.parse(account.encrypted_passphrase)
      );

      // Cria cliente LNMarkets
      const client = new LNMarketsClient(credentials);

      // Obtém trades atuais
      const [openTrades, closedTrades] = await Promise.all([
        client.getOpenTrades(),
        client.getClosedTrades()
      ]);

      // Processa trades abertos
      await this.processOpenTrades(account.user_id, account.account_type, openTrades);

      // Processa trades fechados
      await this.processClosedTrades(account.user_id, account.account_type, closedTrades);

    } catch (error) {
      console.error(`Erro ao verificar trades da conta ${account.id}:`, error);
      
      // Cria notificação de erro
      await this.notificationManager.createNotification({
        userId: account.user_id,
        tradeId: 'error',
        accountType: account.account_type,
        notificationType: 'error',
        title: 'Erro no Monitoramento',
        message: `Erro ao verificar trades da conta ${account.account_type}`,
        tradeData: {
          quantity: 0,
          tradeMargin: 0,
          fees: 0,
          pl: 0,
          netPL: 0,
          accountType: account.account_type,
          tradeId: 'error',
          closedAt: new Date()
        }
      });
    }
  }

  /**
   * Processa trades abertos
   */
  private async processOpenTrades(
    userId: string, 
    accountType: AccountType, 
    trades: LNMarketsTrade[]
  ): Promise<void> {
    for (const trade of trades) {
      try {
        // Verifica se o trade já está sendo monitorado
        const { data: existingTrade } = await supabaseAdmin
          .from('trade_monitoring')
          .select('*')
          .eq('user_id', userId)
          .eq('account_type', accountType)
          .eq('trade_id', trade.id)
          .single();

        if (!existingTrade) {
          // Novo trade aberto - adiciona ao monitoramento
          await supabaseAdmin
            .from('trade_monitoring')
            .insert({
              user_id: userId,
              account_type: accountType,
              trade_id: trade.id,
              trade_data: trade,
              status: 'open'
            });

          // Cria notificação de trade aberto
          await this.notificationManager.createNotification({
            userId,
            tradeId: trade.id,
            accountType,
            notificationType: 'trade_opened',
            title: 'Trade Aberto',
            message: `Novo trade ${accountType} aberto`,
            tradeData: {
              quantity: trade.quantity,
              tradeMargin: trade.margin,
              fees: trade.opening_fee,
              pl: trade.pl,
              netPL: trade.pl - trade.opening_fee,
              accountType,
              tradeId: trade.id,
              closedAt: new Date()
            }
          });
        } else {
          // Atualiza dados do trade existente
          await supabaseAdmin
            .from('trade_monitoring')
            .update({
              trade_data: trade,
              last_checked: new Date().toISOString()
            })
            .eq('id', existingTrade.id);
        }
      } catch (error) {
        console.error(`Erro ao processar trade aberto ${trade.id}:`, error);
      }
    }
  }

  /**
   * Processa trades fechados
   */
  private async processClosedTrades(
    userId: string, 
    accountType: AccountType, 
    trades: LNMarketsTrade[]
  ): Promise<void> {
    for (const trade of trades) {
      try {
        // Verifica se o trade estava sendo monitorado
        const { data: monitoredTrade } = await supabaseAdmin
          .from('trade_monitoring')
          .select('*')
          .eq('user_id', userId)
          .eq('account_type', accountType)
          .eq('trade_id', trade.id)
          .single();

        if (monitoredTrade && monitoredTrade.status === 'open') {
          // Trade foi fechado - atualiza status
          await supabaseAdmin
            .from('trade_monitoring')
            .update({
              trade_data: trade,
              status: 'closed',
              last_checked: new Date().toISOString()
            })
            .eq('id', monitoredTrade.id);

          // Cria notificação de trade fechado
          const totalFees = trade.opening_fee + trade.closing_fee;
          const netPL = trade.pl - totalFees;

          await this.notificationManager.createNotification({
            userId,
            tradeId: trade.id,
            accountType,
            notificationType: 'trade_closed',
            title: 'Trade Fechado',
            message: `Trade ${accountType} fechado com ${netPL >= 0 ? 'lucro' : 'prejuízo'}`,
            tradeData: {
              quantity: trade.quantity,
              tradeMargin: trade.margin,
              fees: totalFees,
              pl: trade.pl,
              netPL,
              accountType,
              tradeId: trade.id,
              closedAt: new Date(trade.closed_ts || Date.now())
            }
          });

          // Envia atualização via WebSocket
          try {
            const { notificationWebSocketServer } = await import('@/lib/notifications/websocket');
            notificationWebSocketServer.broadcastStatusUpdate({
              type: 'trade_closed',
              userId,
              accountType,
              tradeId: trade.id,
              netPL,
              timestamp: new Date()
            });
          } catch (error) {
            console.error('Erro ao enviar atualização WebSocket:', error);
          }

          // Processa fechamento automático para contas associadas
          await this.processAutomaticClosing(userId, accountType, trade.id, trade);
        }
      } catch (error) {
        console.error(`Erro ao processar trade fechado ${trade.id}:`, error);
      }
    }
  }

  /**
   * Processa fechamento automático de trades associados
   */
  private async processAutomaticClosing(
    userId: string, 
    accountType: AccountType, 
    tradeId: string,
    tradeData: LNMarketsTrade
  ): Promise<void> {
    try {
      // Usa o novo sistema de fechamento automático
      const { autoCloseManager } = await import('./auto-close');
      await autoCloseManager.processTradeClose(userId, accountType, tradeId, tradeData);
    } catch (error) {
      console.error('Erro no fechamento automático:', error);
    }
  }



  /**
   * Obtém status do monitoramento
   */
  async getMonitoringStatus(): Promise<MonitoringStatus> {
    try {
      const { data: accounts } = await supabaseAdmin
        .from('encrypted_apis')
        .select('account_type, is_active')
        .eq('is_active', true);

      const { data: trades } = await supabaseAdmin
        .from('trade_monitoring')
        .select('status');

      const activeAccounts = {
        owner: accounts?.some(a => a.account_type === 'owner') || false,
        shadow: accounts?.some(a => a.account_type === 'shadow') || false,
        slave: accounts?.some(a => a.account_type === 'slave') || false
      };

      const tradesCount = {
        open: trades?.filter(t => t.status === 'open').length || 0,
        closed: trades?.filter(t => t.status === 'closed').length || 0,
        total: trades?.length || 0
      };

      return {
        isActive: this.isRunning,
        lastCheck: new Date(),
        activeAccounts,
        tradesCount
      };
    } catch (error) {
      console.error('Erro ao obter status do monitoramento:', error);
      return {
        isActive: this.isRunning,
        lastCheck: new Date(),
        activeAccounts: { owner: false, shadow: false, slave: false },
        tradesCount: { open: 0, closed: 0, total: 0 }
      };
    }
  }
}

// Instância singleton do monitor
export const tradeMonitor = new TradeMonitor(); 