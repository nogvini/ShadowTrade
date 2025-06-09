import { createRestClient } from '@ln-markets/api';
import type { LNMarketsCredentials, LNMarketsTrade } from '@/types/backend';

export class LNMarketsClient {
  private client: any;
  private credentials: LNMarketsCredentials;

  constructor(credentials: LNMarketsCredentials) {
    this.credentials = credentials;
    this.client = createRestClient({
      key: credentials.apiKey,
      secret: credentials.apiSecret,
      passphrase: credentials.passphrase,
      network: credentials.network || 'mainnet'
    });
  }

  /**
   * Testa a conexão com a API
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Tenta obter informações da conta para validar credenciais
      await this.client.getUser();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro de conexão com LNMarkets' 
      };
    }
  }

  /**
   * Obtém todos os trades abertos
   */
  async getOpenTrades(): Promise<LNMarketsTrade[]> {
    try {
      const trades = await this.client.futuresGetTrades();
      return trades.filter((trade: any) => trade.open && trade.running);
    } catch (error) {
      console.error('Erro ao obter trades abertos:', error);
      throw new Error(`Erro ao obter trades abertos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Obtém todos os trades fechados
   */
  async getClosedTrades(): Promise<LNMarketsTrade[]> {
    try {
      const trades = await this.client.futuresGetTrades();
      return trades.filter((trade: any) => trade.closed);
    } catch (error) {
      console.error('Erro ao obter trades fechados:', error);
      throw new Error(`Erro ao obter trades fechados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Obtém um trade específico por ID
   */
  async getTrade(tradeId: string): Promise<LNMarketsTrade | null> {
    try {
      const trade = await this.client.futuresGetTrade({ id: tradeId });
      return trade;
    } catch (error) {
      console.error(`Erro ao obter trade ${tradeId}:`, error);
      return null;
    }
  }

  /**
   * Fecha um trade específico
   */
  async closeTrade(tradeId: string): Promise<{ success: boolean; trade?: LNMarketsTrade; error?: string }> {
    try {
      const closedTrade = await this.client.futuresCloseTrade({ id: tradeId });
      return { success: true, trade: closedTrade };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao fechar trade' 
      };
    }
  }

  /**
   * Cria um novo trade
   */
  async createTrade(params: {
    type: 'm' | 'l';
    side: 'b' | 's';
    quantity: number;
    margin: number;
    leverage?: number;
    price?: number;
    takeprofit?: number;
    stoploss?: number;
  }): Promise<{ success: boolean; trade?: LNMarketsTrade; error?: string }> {
    try {
      const trade = await this.client.futuresNewTrade(params);
      return { success: true, trade };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao criar trade' 
      };
    }
  }

  /**
   * Obtém informações da conta
   */
  async getAccountInfo(): Promise<any> {
    try {
      return await this.client.getUser();
    } catch (error) {
      console.error('Erro ao obter informações da conta:', error);
      throw new Error(`Erro ao obter informações da conta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Obtém o preço atual do Bitcoin
   */
  async getCurrentPrice(): Promise<number> {
    try {
      const ticker = await this.client.futuresTicker();
      return ticker.last_price;
    } catch (error) {
      console.error('Erro ao obter preço atual:', error);
      throw new Error(`Erro ao obter preço atual: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}

/**
 * Factory function para criar cliente LNMarkets
 */
export function createLNMarketsClient(credentials: LNMarketsCredentials): LNMarketsClient {
  return new LNMarketsClient(credentials);
} 