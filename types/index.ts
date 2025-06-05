// types/index.ts

// Configuração base para todas as contas
export interface AccountConfig {
  id?: string; // Opcional, pode ser gerado ou vir da API
  apiKey: string;
  apiSecret: string;
  passphrase?: string; // LNMarkets usa, outras podem não usar
  isConnected: boolean;
  maskedApiKey?: string; // Gerado após conexão bem-sucedida
}

// Configuração específica para a conta Owner
// Por enquanto, pode ser igual à AccountConfig, mas podemos especializá-la se necessário.
export interface OwnerAccountConfig extends AccountConfig {}

// Configuração específica para a conta Shadow
export interface ShadowAccountConfig extends AccountConfig {
  amount: number; // Quantidade em dólares
  shadowClose: boolean; // Checkbox "Shadow Close"
  takeProfit?: number; // Opcional, oculto se shadowClose for true
}

// Configuração específica para a conta Slave
export interface SlaveAccountConfig extends AccountConfig {
  amount: number; // Quantidade em dólares
}

// Estado global da aplicação
export interface AppState {
  currentStep: 1 | 2; // Etapa 1: Owner, Etapa 2: Shadow/Slave
  ownerConfig: OwnerAccountConfig | null;
  shadowConfig: ShadowAccountConfig | null;
  slaveConfig: SlaveAccountConfig | null;
  isOwnerConfigured: boolean; // Para controlar a exibição da Etapa 2
  isLoading: boolean; // Estado de carregamento global para chamadas de API simuladas
  errors: Record<string, string>; // Erros de validação de formulário
  activeModal: 'shadow' | 'slave' | null; // Controla qual modal de configuração está ativo
  // Loading popup controls
  loadingMessage: string;
  showLoadingPopup: boolean;
}

// Tipos para os formulários, podem ser parciais das configs principais
export type OwnerFormData = Pick<OwnerAccountConfig, 'apiKey' | 'apiSecret' | 'passphrase'>;
export type ShadowFormData = Pick<ShadowAccountConfig, 'apiKey' | 'apiSecret' | 'passphrase' | 'amount' | 'shadowClose' | 'takeProfit'>;
export type SlaveFormData = Pick<SlaveAccountConfig, 'apiKey' | 'apiSecret' | 'passphrase' | 'amount'>; 