// Tipos para integração com LNMarkets API
export interface LNMarketsCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  network?: 'mainnet' | 'testnet';
}

export interface LNMarketsTrade {
  id: string;
  uid: string;
  type: 'm' | 'l'; // market or limit
  side: 'b' | 's'; // buy or sell
  quantity: number;
  margin: number;
  leverage?: number;
  price?: number;
  liquidation?: number;
  stoploss?: number;
  takeprofit?: number;
  exit_price?: number;
  pl: number; // profit/loss
  opening_fee: number;
  closing_fee: number;
  maintenance_margin: number;
  creation_ts: number;
  market_filled_ts?: number;
  closed_ts?: number;
  open: boolean;
  running: boolean;
  canceled: boolean;
  closed: boolean;
  last_update_ts?: number;
  sum_carry_fees?: number;
  entry_price?: number;
  entry_margin?: number;
}

// Tipos para contas do sistema
export type AccountType = 'owner' | 'shadow' | 'slave';

export interface AccountConfig {
  id: string;
  userId: string;
  accountType: AccountType;
  credentials: LNMarketsCredentials;
  quantity?: number;
  takeProfit?: number;
  shadowClose?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para associações de trades
export interface TradeAssociation {
  id: string;
  userId: string;
  ownerTradeId?: string;
  shadowTradeId?: string;
  slaveTradeId?: string;
  associationType: 'shadow_to_owner' | 'slave_to_shadow' | 'slave_to_owner';
  createdAt: Date;
}

// Tipos para monitoramento
export interface TradeMonitoring {
  id: string;
  userId: string;
  accountType: AccountType;
  tradeId: string;
  tradeData: LNMarketsTrade;
  status: 'open' | 'closed' | 'expired' | 'canceled';
  lastChecked: Date;
  createdAt: Date;
}

// Tipos para notificações
export type NotificationType = 'trade_closed' | 'trade_opened' | 'error' | 'warning';

export interface NotificationData {
  quantity: number;
  tradeMargin: number;
  fees: number;
  pl: number;
  netPL: number; // PL - Fees
  accountType: AccountType;
  tradeId: string;
  closedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  tradeId: string;
  accountType: AccountType;
  notificationType: NotificationType;
  title: string;
  message: string;
  tradeData: NotificationData;
  isRead: boolean;
  createdAt: Date;
}

export interface NotificationQueue {
  id: string;
  userId: string;
  notificationId: string;
  priority: number;
  retryCount: number;
  scheduledFor: Date;
  createdAt: Date;
}

// Tipos para API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MonitoringStatus {
  isActive: boolean;
  lastCheck: Date;
  activeAccounts: {
    owner: boolean;
    shadow: boolean;
    slave: boolean;
  };
  tradesCount: {
    open: number;
    closed: number;
    total: number;
  };
}

// Tipos para WebSocket
export interface WebSocketMessage {
  type: 'notification' | 'trade_update' | 'status_update' | 'error';
  data: any;
  timestamp: Date;
}

export interface WebSocketConnection {
  userId: string;
  connectionId: string;
  connectedAt: Date;
}

// Tipos para criptografia
export interface EncryptedData {
  encryptedData: string;
  iv: string;
  salt: string;
}

// Tipos para configuração do sistema
export interface SystemConfig {
  monitoringInterval: number; // em minutos
  maxRetries: number;
  notificationRetentionDays: number;
  encryptionKey: string;
  lnmarketsRateLimit: number; // requests per minute
} 