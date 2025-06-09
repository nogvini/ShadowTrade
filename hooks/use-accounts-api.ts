import { useCallback } from 'react';
import { useApi, useApiCall } from './use-api';

export interface LNMarketsCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  network: 'mainnet' | 'testnet';
}

export interface OwnerAccountConfig extends LNMarketsCredentials {}

export interface ShadowAccountConfig extends LNMarketsCredentials {
  quantity: number;
  take_profit?: number;
  shadow_close: boolean;
}

export interface SlaveAccountConfig extends LNMarketsCredentials {
  quantity: number;
}

export interface AccountResponse {
  id: string;
  user_id: string;
  account_type: 'owner' | 'shadow' | 'slave';
  network: string;
  created_at: string;
  updated_at: string;
  // Dados específicos por tipo
  quantity?: number;
  take_profit?: number;
  shadow_close?: boolean;
}

export function useAccountsApi() {
  const { call, loading } = useApiCall();
  const ownerApi = useApi<AccountResponse>();
  const shadowApi = useApi<AccountResponse>();
  const slaveApi = useApi<AccountResponse>();

  // Owner Account
  const createOwnerAccount = useCallback(async (config: OwnerAccountConfig) => {
    return await call<AccountResponse>('/api/accounts/owner', {
      method: 'POST',
      body: config,
    });
  }, [call]);

  const getOwnerAccount = useCallback(async () => {
    return await ownerApi.execute('/api/accounts/owner');
  }, [ownerApi]);

  const deleteOwnerAccount = useCallback(async () => {
    return await call('/api/accounts/owner', {
      method: 'DELETE',
    });
  }, [call]);

  // Shadow Account
  const createShadowAccount = useCallback(async (config: ShadowAccountConfig) => {
    return await call<AccountResponse>('/api/accounts/shadow', {
      method: 'POST',
      body: config,
    });
  }, [call]);

  const getShadowAccount = useCallback(async () => {
    return await shadowApi.execute('/api/accounts/shadow');
  }, [shadowApi]);

  const deleteShadowAccount = useCallback(async () => {
    return await call('/api/accounts/shadow', {
      method: 'DELETE',
    });
  }, [call]);

  // Slave Account
  const createSlaveAccount = useCallback(async (config: SlaveAccountConfig) => {
    return await call<AccountResponse>('/api/accounts/slave', {
      method: 'POST',
      body: config,
    });
  }, [call]);

  const getSlaveAccount = useCallback(async () => {
    return await slaveApi.execute('/api/accounts/slave');
  }, [slaveApi]);

  const deleteSlaveAccount = useCallback(async () => {
    return await call('/api/accounts/slave', {
      method: 'DELETE',
    });
  }, [call]);

  // Helpers para verificar configuração
  const hasOwnerAccount = useCallback(() => {
    return ownerApi.data !== null;
  }, [ownerApi.data]);

  const hasShadowAccount = useCallback(() => {
    return shadowApi.data !== null;
  }, [shadowApi.data]);

  const hasSlaveAccount = useCallback(() => {
    return slaveApi.data !== null;
  }, [slaveApi.data]);

  const getAllAccounts = useCallback(async () => {
    const [owner, shadow, slave] = await Promise.allSettled([
      getOwnerAccount(),
      getShadowAccount(),
      getSlaveAccount(),
    ]);

    return {
      owner: owner.status === 'fulfilled' ? owner.value : null,
      shadow: shadow.status === 'fulfilled' ? shadow.value : null,
      slave: slave.status === 'fulfilled' ? slave.value : null,
    };
  }, [getOwnerAccount, getShadowAccount, getSlaveAccount]);

  return {
    // Owner
    createOwnerAccount,
    getOwnerAccount,
    deleteOwnerAccount,
    ownerAccount: ownerApi.data,
    ownerLoading: ownerApi.loading,
    ownerError: ownerApi.error,

    // Shadow
    createShadowAccount,
    getShadowAccount,
    deleteShadowAccount,
    shadowAccount: shadowApi.data,
    shadowLoading: shadowApi.loading,
    shadowError: shadowApi.error,

    // Slave
    createSlaveAccount,
    getSlaveAccount,
    deleteSlaveAccount,
    slaveAccount: slaveApi.data,
    slaveLoading: slaveApi.loading,
    slaveError: slaveApi.error,

    // Helpers
    hasOwnerAccount,
    hasShadowAccount,
    hasSlaveAccount,
    getAllAccounts,
    
    // Loading geral
    loading,
  };
} 