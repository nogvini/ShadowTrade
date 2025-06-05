'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import {
  AppState,
  OwnerAccountConfig,
  ShadowAccountConfig,
  SlaveAccountConfig,
  OwnerFormData,
  ShadowFormData,
  SlaveFormData
} from '@/types'; // Certifique-se que o path para types está correto
import { maskApiKey } from '@/utils/api-mask'; // Importar a função utilitária
import { SIMULATED_API_DELAY } from '@/utils/constants'; // Importar a constante

interface AppContextType extends AppState {
  setOwnerConfig: (data: OwnerFormData) => Promise<boolean>; // Retorna true em sucesso
  updateOwnerConfig: (config: OwnerAccountConfig) => void;
  setShadowConfig: (data: ShadowFormData) => Promise<boolean>;
  updateShadowConfig: (config: ShadowAccountConfig) => void;
  setSlaveConfig: (data: SlaveFormData) => Promise<boolean>;
  updateSlaveConfig: (config: SlaveAccountConfig) => void;
  resetOwnerConfig: () => void;
  resetShadowConfig: () => void;
  resetSlaveConfig: () => void;
  openModal: (modal: 'shadow' | 'slave') => void;
  closeModal: () => void;
  setGlobalError: (field: string, message: string) => void;
  clearGlobalError: (field: string) => void;
  clearAllGlobalErrors: () => void;
  // Adicionar mais funções de dispatch conforme necessário
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  currentStep: 1,
  ownerConfig: null,
  shadowConfig: null,
  slaveConfig: null,
  isOwnerConfigured: false,
  isLoading: false,
  errors: {},
  activeModal: null,
};

// Usar a constante importada para o delay da simulação
const simulateApiCall = (success: boolean = true, delay: number = SIMULATED_API_DELAY): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve();
      } else {
        reject(new Error('Simulated API Error'));
      }
    }, delay);
  });
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);

  const setLoading = (isLoading: boolean) => setState(prev => ({ ...prev, isLoading }));
  const setErrors = (field: string, message: string) => {
    setState(prev => ({ ...prev, errors: { ...prev.errors, [field]: message } }));
  };
  const clearError = (field: string) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      return { ...prev, errors: newErrors };
    });
  };
  const clearAllErrors = () => setState(prev => ({ ...prev, errors: {} }));

  const setOwnerConfig = useCallback(async (data: OwnerFormData): Promise<boolean> => {
    setLoading(true);
    clearAllErrors();
    try {
      await simulateApiCall();
      const newConfig: OwnerAccountConfig = {
        ...data,
        id: `owner-${Date.now()}`,
        isConnected: true,
        maskedApiKey: maskApiKey(data.apiKey) // Usar a função utilitária
      };
      setState(prev => ({
        ...prev,
        ownerConfig: newConfig,
        isOwnerConfigured: true,
        currentStep: 2,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      setErrors('ownerSubmit', 'Falha ao conectar API Owner. Verifique suas credenciais.');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const updateOwnerConfig = useCallback((config: OwnerAccountConfig) => {
    setState(prev => ({ ...prev, ownerConfig: config, isOwnerConfigured: config.isConnected, currentStep: config.isConnected ? 2 : 1 }));
  }, []);

  const resetOwnerConfig = useCallback(() => {
    setState(prev => ({
      ...prev,
      ownerConfig: null,
      isOwnerConfigured: false,
      currentStep: 1,
      // Potencialmente resetar Shadow e Slave também
      shadowConfig: null, 
      slaveConfig: null,
      activeModal: null,
      errors: {}
    }));
  }, []);

  // Funções para Shadow e Slave (similares à Owner)
  const setShadowConfig = useCallback(async (data: ShadowFormData): Promise<boolean> => {
    setLoading(true);
    clearAllErrors();
    try {
      await simulateApiCall();
      const newConfig: ShadowAccountConfig = {
        ...data,
        id: `shadow-${Date.now()}`,
        isConnected: true,
        maskedApiKey: maskApiKey(data.apiKey) // Usar a função utilitária
      };
      setState(prev => ({ ...prev, shadowConfig: newConfig, isLoading: false, activeModal: null }));
      return true;
    } catch (error) {
      setErrors('shadowSubmit', 'Falha ao configurar Shadow Account.');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const updateShadowConfig = useCallback((config: ShadowAccountConfig) => {
    setState(prev => ({ ...prev, shadowConfig: config }));
  }, []);

 const resetShadowConfig = useCallback(() => {
    setState(prev => ({ ...prev, shadowConfig: null, errors: {} }));
  }, []);


  const setSlaveConfig = useCallback(async (data: SlaveFormData): Promise<boolean> => {
    setLoading(true);
    clearAllErrors();
    try {
      await simulateApiCall();
      const newConfig: SlaveAccountConfig = {
        ...data,
        id: `slave-${Date.now()}`,
        isConnected: true,
        maskedApiKey: maskApiKey(data.apiKey) // Usar a função utilitária
      };
      setState(prev => ({ ...prev, slaveConfig: newConfig, isLoading: false, activeModal: null }));
      return true;
    } catch (error) {
      setErrors('slaveSubmit', 'Falha ao configurar Slave Account.');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const updateSlaveConfig = useCallback((config: SlaveAccountConfig) => {
    setState(prev => ({ ...prev, slaveConfig: config }));
  }, []);

  const resetSlaveConfig = useCallback(() => {
    setState(prev => ({ ...prev, slaveConfig: null, errors: {} }));
  }, []);

  const openModal = useCallback((modal: 'shadow' | 'slave') => {
    setState(prev => ({ ...prev, activeModal: modal }));
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({ ...prev, activeModal: null, errors: {} })); // Limpa erros ao fechar modal
  }, []);
  
  const value = useMemo(() => ({
    ...state,
    setOwnerConfig,
    updateOwnerConfig,
    setShadowConfig,
    updateShadowConfig,
    setSlaveConfig,
    updateSlaveConfig,
    resetOwnerConfig,
    resetShadowConfig,
    resetSlaveConfig,
    openModal,
    closeModal,
    setGlobalError: setErrors,
    clearGlobalError: clearError,
    clearAllGlobalErrors: clearAllErrors
  }), [state, setOwnerConfig, updateOwnerConfig, setShadowConfig, updateShadowConfig, setSlaveConfig, updateSlaveConfig, resetOwnerConfig, resetShadowConfig, resetSlaveConfig, openModal, closeModal]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppState = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}; 