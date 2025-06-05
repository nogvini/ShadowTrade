'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/contexts/AppContext';
import { SlaveFormData } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { AlertTriangle, Settings } from 'lucide-react';

const SlaveConfigModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    slaveConfig,
    setSlaveConfig,
    isLoading,
    errors,
    clearGlobalError,
  } = useAppState();

  const initialFormData: SlaveFormData = {
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    amount: 0,
  };

  const [formData, setFormData] = useState<SlaveFormData>(initialFormData);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeModal === 'slave') {
      if (slaveConfig) {
        setFormData({
          apiKey: slaveConfig.apiKey, // Por segurança, idealmente não repopular a chave real, forçar reinserção.
          apiSecret: '', // Forçar reinserção
          passphrase: '', // Forçar reinserção
          amount: slaveConfig.amount,
        });
      } else {
        setFormData(initialFormData);
      }
      setLocalErrors({}); 
    }
  }, [activeModal, slaveConfig]);
  
  useEffect(() => {
    if (errors.slaveSubmit) {
      setLocalErrors(prev => ({...prev, submit: errors.slaveSubmit}));
    } else {
      setLocalErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.submit;
        return newErrors;
      });
    }
  }, [errors.slaveSubmit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
    if (localErrors[name]) {
      setLocalErrors((prev) => { delete prev[name]; return {...prev}; });
    }
    if (errors.slaveSubmit) clearGlobalError('slaveSubmit');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.apiKey.trim()) newErrors.apiKey = 'API Key é obrigatória.';
    if (!formData.apiSecret.trim()) newErrors.apiSecret = 'API Secret é obrigatório.';
    if (!formData.passphrase?.trim()) newErrors.passphrase = 'Passphrase é obrigatória.';
    if (formData.amount <= 0) newErrors.amount = 'Quantidade deve ser maior que zero.';
    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    await setSlaveConfig(formData);
    // O AppContext cuidará de fechar o modal e limpar erros em caso de sucesso.
  };

  if (activeModal !== 'slave') return null;

  return (
    <Modal isOpen={activeModal === 'slave'} onClose={closeModal} title="Configurar Slave Account" size="lg">
      <div className="px-1 sm:px-2">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 pt-2">
          <div>
            <Label htmlFor="slave-apiKey" className="text-xs sm:text-sm">API Key</Label>
            <Input
              id="slave-apiKey"
              name="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="API Key da Conta Slave"
              error={!!localErrors.apiKey}
              disabled={isLoading}
              size="default"
              className="mt-1 w-full"
            />
            {localErrors.apiKey && <p className="text-error text-[9px] sm:text-[10px] mt-1 px-1">{localErrors.apiKey}</p>}
          </div>

          <div>
            <Label htmlFor="slave-apiSecret" className="text-xs sm:text-sm">API Secret</Label>
            <Input
              id="slave-apiSecret"
              name="apiSecret"
              type="password"
              value={formData.apiSecret}
              onChange={handleChange}
              placeholder="API Secret da Conta Slave"
              error={!!localErrors.apiSecret}
              disabled={isLoading}
              size="default"
              className="mt-1 w-full"
            />
            {localErrors.apiSecret && <p className="text-error text-[9px] sm:text-[10px] mt-1 px-1">{localErrors.apiSecret}</p>}
          </div>

          <div>
            <Label htmlFor="slave-passphrase" className="text-xs sm:text-sm">Passphrase (Opcional)</Label>
            <Input
              id="slave-passphrase"
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
            <Label htmlFor="slave-amount" className="text-xs sm:text-sm">Quantidade (USD)</Label>
            <Input
              id="slave-amount"
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
              {slaveConfig ? 'Salvar Alterações' : 'Conectar Slave Account'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default SlaveConfigModal; 