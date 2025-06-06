'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/contexts/AppContext';
import { ShadowFormData } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { AlertTriangle, Settings } from 'lucide-react';

const ShadowConfigModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    shadowConfig,
    setShadowConfig,
    isLoading,
    errors,
    clearGlobalError,
  } = useAppState();

  const initialFormData: ShadowFormData = {
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    amount: 0,
    shadowClose: false,
    takeProfit: undefined,
  };

  const [formData, setFormData] = useState<ShadowFormData>(initialFormData);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeModal === 'shadow') {
      if (shadowConfig) {
        setFormData({
          apiKey: shadowConfig.apiKey,
          apiSecret: '',
          passphrase: '',
          amount: shadowConfig.amount,
          shadowClose: shadowConfig.shadowClose,
          takeProfit: shadowConfig.takeProfit,
        });
      } else {
        setFormData(initialFormData);
      }
      setLocalErrors({});
    } else {
    }
  }, [activeModal, shadowConfig]);

  useEffect(() => {
    if (errors.shadowSubmit) {
      setLocalErrors(prev => ({...prev, submit: errors.shadowSubmit}));
    } else {
      setLocalErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.submit;
        return newErrors;
      });
    }
  }, [errors.shadowSubmit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));
    if (localErrors[name]) {
      setLocalErrors((prev) => { delete prev[name]; return {...prev}; });
    }
    if (errors.shadowSubmit) clearGlobalError('shadowSubmit');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.apiKey.trim()) newErrors.apiKey = 'API Key é obrigatória.';
    if (!formData.apiSecret.trim()) newErrors.apiSecret = 'API Secret é obrigatório.';
    if (!formData.passphrase?.trim()) newErrors.passphrase = 'Passphrase é obrigatória.';
    if (formData.amount <= 0) newErrors.amount = 'Quantidade deve ser maior que zero.';
    if (!formData.shadowClose && (formData.takeProfit === undefined || formData.takeProfit <= 0)) {
      newErrors.takeProfit = 'Take Profit deve ser maior que zero se Shadow Close não estiver ativo.';
    }
    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const dataToSubmit = { ...formData };
    if (formData.shadowClose) {
      delete dataToSubmit.takeProfit;
    }

    const success = await setShadowConfig(dataToSubmit);
  };

  if (activeModal !== 'shadow') return null;

  return (
    <Modal isOpen={activeModal === 'shadow'} onClose={closeModal} title="Configurar Shadow Account" size="lg">
      <div className="px-1 sm:px-2">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 pt-2">
          <div>
            <Label htmlFor="shadow-apiKey" className="text-xs sm:text-sm">API Key</Label>
            <Input
              id="shadow-apiKey"
              name="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="API Key da Conta Shadow"
              error={!!localErrors.apiKey}
              disabled={isLoading}
              size="default"
              className="mt-1 w-full"
            />
            {localErrors.apiKey && <p className="text-error text-[9px] sm:text-[10px] mt-1 px-1">{localErrors.apiKey}</p>}
          </div>

          <div>
            <Label htmlFor="shadow-apiSecret" className="text-xs sm:text-sm">API Secret</Label>
            <Input
              id="shadow-apiSecret"
              name="apiSecret"
              type="password"
              value={formData.apiSecret}
              onChange={handleChange}
              placeholder="API Secret da Conta Shadow"
              error={!!localErrors.apiSecret}
              disabled={isLoading}
              size="default"
              className="mt-1 w-full"
            />
            {localErrors.apiSecret && <p className="text-error text-[9px] sm:text-[10px] mt-1 px-1">{localErrors.apiSecret}</p>}
          </div>

          <div>
            <Label htmlFor="shadow-passphrase" className="text-xs sm:text-sm">Passphrase (Opcional)</Label>
            <Input
              id="shadow-passphrase"
              name="passphrase"
              type="password"
              value={formData.passphrase || ''}
              onChange={handleChange}
              placeholder="Passphrase (se aplicável)"
              error={!!localErrors.passphrase}
              disabled={isLoading}
              size="default"
              className="mt-1 w-full"
            />
            {localErrors.passphrase && <p className="text-error text-[9px] sm:text-[10px] mt-1 px-1">{localErrors.passphrase}</p>}
          </div>

          <div>
            <Label htmlFor="shadow-amount" className="text-xs sm:text-sm">Quantidade (USD)</Label>
            <Input
              id="shadow-amount"
              name="amount"
              type="number"
              value={formData.amount.toString()}
              onChange={handleChange}
              placeholder="Ex: 1000"
              error={!!localErrors.amount}
              disabled={isLoading}
              size="default"
              className="mt-1 w-full"
            />
            {localErrors.amount && <p className="text-error text-[9px] sm:text-[10px] mt-1 px-1">{localErrors.amount}</p>}
          </div>

          <div className="flex items-center space-x-2 pt-1 sm:pt-2 px-1">
            <Checkbox
              id="shadow-shadowClose"
              name="shadowClose"
              checked={formData.shadowClose}
              onCheckedChange={(checked) => {
                setFormData((prev) => ({ ...prev, shadowClose: Boolean(checked) }));
                if (localErrors.takeProfit && Boolean(checked)) {
                  setLocalErrors((prev) => { delete prev.takeProfit; return {...prev}; });
                }
              }}
              disabled={isLoading}
              className="h-4 w-4 sm:h-5 sm:w-5"
            />
            <Label htmlFor="shadow-shadowClose" className="text-[10px] sm:text-xs cursor-pointer select-none">
              Ativar Shadow Close (fecha automaticamente com a Owner)
            </Label>
          </div>

          {!formData.shadowClose && (
            <div>
              <Label htmlFor="shadow-takeProfit" className="text-xs sm:text-sm">Take Profit (%)</Label>
              <Input
                id="shadow-takeProfit"
                name="takeProfit"
                type="number"
                value={formData.takeProfit?.toString() || ''}
                onChange={handleChange}
                placeholder="Ex: 5 (para 5%)"
                error={!!localErrors.takeProfit}
                disabled={isLoading}
                size="default"
                className="mt-1 w-full"
              />
              {localErrors.takeProfit && <p className="text-error text-[9px] sm:text-[10px] mt-1 px-1">{localErrors.takeProfit}</p>}
            </div>
          )}

          {localErrors.submit && (
            <div className="flex items-center text-error text-[9px] sm:text-[10px] p-2 bg-error/10 rounded-md mx-1">
              <AlertTriangle size={14} className="mr-2 flex-shrink-0" /> 
              {localErrors.submit}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-5 px-1">
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeModal} 
              disabled={isLoading} 
              size="default"
              className="w-full sm:w-auto min-w-[100px]"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              variant="success" 
              icon={Settings} 
              size="default"
              className="w-full sm:w-auto min-w-[100px]"
            >
              {shadowConfig ? 'Salvar Alterações' : 'Conectar Shadow Account'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ShadowConfigModal; 