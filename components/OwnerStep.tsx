'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/contexts/AppContext';
import { OwnerFormData } from '@/types';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, AlertTriangle, Trash2, Edit3, KeyRound, X } from 'lucide-react';

const OwnerStep: React.FC = () => {
  const {
    ownerConfig,
    setOwnerConfig,
    resetOwnerConfig,
    isLoading,
    errors,
    clearGlobalError,
    isOwnerConfigured,
  } = useAppState();

  const [formData, setFormData] = useState<OwnerFormData>({
    apiKey: '',
    apiSecret: '',
    passphrase: '',
  });
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Limpar erros locais quando erros globais relacionados ao ownerSubmit são limpos ou surgem
    if (errors.ownerSubmit) {
      setLocalErrors(prev => ({...prev, submit: errors.ownerSubmit}));
    } else {
      setLocalErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.submit;
        return newErrors;
      });
    }
  }, [errors.ownerSubmit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (localErrors[name]) {
      setLocalErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (errors.ownerSubmit) clearGlobalError('ownerSubmit');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.apiKey.trim()) newErrors.apiKey = 'API Key é obrigatória.';
    if (!formData.apiSecret.trim()) newErrors.apiSecret = 'API Secret é obrigatório.';
    if (!formData.passphrase?.trim()) newErrors.passphrase = 'Passphrase é obrigatória.'; // LNMarkets specific
    
    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const success = await setOwnerConfig(formData);
    if (success) {
      setIsEditing(false);
      setFormData({ apiKey: '', apiSecret: '', passphrase: '' });
    }
  };

  const handleEdit = () => {
    if(ownerConfig) {
      setFormData({
        apiKey: '', // Por segurança, não preenchemos com a chave real
        apiSecret: '', // Forçar reinserção do secret
        passphrase: '' // Forçar reinserção da passphrase
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({ apiKey: '', apiSecret: '', passphrase: '' });
    setLocalErrors({});
  };

  const handleDisconnect = () => {
    resetOwnerConfig();
    setIsEditing(false);
    setFormData({ apiKey: '', apiSecret: '', passphrase: '' });
    setLocalErrors({});
  };

  if (isOwnerConfigured && ownerConfig) {
    return (
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Status Card - Sempre visível */}
        <Card className="w-full lg:w-auto lg:flex-1 lg:max-w-lg shadow-depth-active light-glow inner-glow shadow-transition bg-bg-secondary border-success">
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 size={48} className="text-success mb-4" />
            <h2 className="text-sm sm:text-lg uppercase tracking-wider mb-2 text-success shadow-text-lg text-shadow-hover" data-text="Owner API Conectada!">Owner API Conectada!</h2>
            <p className="text-[10px] sm:text-xs text-text-secondary mb-1 break-all px-2 shadow-text-sm" data-text={`API Key: ${ownerConfig.maskedApiKey}`}>API Key: {ownerConfig.maskedApiKey}</p>
            <p className="text-[10px] sm:text-xs text-text-secondary mb-6 shadow-text-sm" data-text="Status: Ativa e pronta.">Status: Ativa e pronta.</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                onClick={handleEdit} 
                variant="outline" 
                size="sm" 
                icon={Edit3} 
                className="w-full sm:w-auto" 
                disabled={isEditing}
              >
                {isEditing ? 'Editando...' : 'Editar API'}
              </Button>
              <Button 
                onClick={handleDisconnect} 
                variant="destructive" 
                size="sm" 
                icon={Trash2}
                className="w-full sm:w-auto"
                disabled={isEditing}
              >
                Desconectar
              </Button>
            </div>
            <p className="text-[8px] sm:text-[10px] text-text-secondary/70 mt-4 px-2 shadow-text-sm" data-text="Gerencie suas credenciais de API com segurança.">Gerencie suas credenciais de API com segurança.</p>
          </div>
        </Card>

        {/* Edit Panel - Lateral slide-in */}
        <div className={`
          w-full lg:w-auto lg:flex-1 lg:max-w-xl transition-all duration-500 ease-smooth overflow-hidden
          ${isEditing 
            ? 'max-h-screen opacity-100 translate-x-0' 
            : 'max-h-0 lg:max-h-screen opacity-0 lg:opacity-0 translate-x-full lg:translate-x-full pointer-events-none'
          }
        `}>
          <Card className="shadow-depth light-glow shadow-transition bg-bg-secondary border-text-primary">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm md:text-base uppercase tracking-wider text-text-primary shadow-text-sm" data-text="Editar Credenciais">Editar Credenciais</h3>
              <Button
                onClick={handleCancelEdit}
                variant="ghost"
                size="sm"
                icon={X}
                className="text-text-secondary hover:text-text-primary"
              >
                Cancelar
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="edit-apiKey" className="block text-[10px] sm:text-xs text-text-secondary mb-1.5 pl-1 shadow-text-sm" data-text="Nova API Key">Nova API Key</label>
                <Input
                  id="edit-apiKey"
                  name="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={handleChange}
                  placeholder="Nova API Key"
                  error={!!localErrors.apiKey}
                  disabled={isLoading}
                  size="sm"
                  className="w-full"
                />
                {localErrors.apiKey && <p className="text-error text-[9px] sm:text-[10px] mt-1 pl-1 break-words shadow-text-sm" data-text={localErrors.apiKey}>{localErrors.apiKey}</p>}
              </div>

              <div>
                <label htmlFor="edit-apiSecret" className="block text-[10px] sm:text-xs text-text-secondary mb-1.5 pl-1 shadow-text-sm" data-text="Novo API Secret">Novo API Secret</label>
                <Input
                  id="edit-apiSecret"
                  name="apiSecret"
                  type="password"
                  value={formData.apiSecret}
                  onChange={handleChange}
                  placeholder="Novo API Secret"
                  error={!!localErrors.apiSecret}
                  disabled={isLoading}
                  size="sm"
                  className="w-full"
                />
                {localErrors.apiSecret && <p className="text-error text-[9px] sm:text-[10px] mt-1 pl-1 break-words shadow-text-sm" data-text={localErrors.apiSecret}>{localErrors.apiSecret}</p>}
              </div>

              <div>
                <label htmlFor="edit-passphrase" className="block text-[10px] sm:text-xs text-text-secondary mb-1.5 pl-1 shadow-text-sm" data-text="Nova Passphrase">Nova Passphrase</label>
                <Input
                  id="edit-passphrase"
                  name="passphrase"
                  type="password"
                  value={formData.passphrase || ''}
                  onChange={handleChange}
                  placeholder="Nova Passphrase"
                  error={!!localErrors.passphrase}
                  disabled={isLoading}
                  size="sm"
                  className="w-full"
                />
                {localErrors.passphrase && <p className="text-error text-[9px] sm:text-[10px] mt-1 pl-1 break-words shadow-text-sm" data-text={localErrors.passphrase}>{localErrors.passphrase}</p>}
              </div>

              {localErrors.submit && (
                <div className="flex items-start text-error text-[9px] sm:text-[10px] p-2 bg-error/10 rounded-md shadow-text-sm" data-text={localErrors.submit}>
                  <AlertTriangle size={12} className="mr-2 flex-shrink-0 mt-0.5" /> 
                  <span className="break-words">{localErrors.submit}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <Button 
                  type="button"
                  onClick={handleCancelEdit}
                  variant="outline" 
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto" 
                  disabled={isLoading} 
                  variant="success" 
                  size="sm"
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Formulário inicial (configuração primeira vez)
  return (
    <Card className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl shadow-depth light-glow shadow-transition bg-bg-secondary">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="text-center mb-4 sm:mb-6">
          <KeyRound size={32} className="mx-auto mb-3 text-text-primary text-shadow-hover" />
          <h2 className="text-sm sm:text-lg md:text-xl uppercase tracking-wider text-text-primary shadow-text-lg text-shadow-hover" data-text="Configurar Owner API">Configurar Owner API</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-text-secondary mt-1 px-2 shadow-text-sm" data-text="Insira as credenciais da sua conta principal (LNMarkets).">Insira as credenciais da sua conta principal (LNMarkets).</p>
        </div>
        
        <div>
          <label htmlFor="apiKey" className="block text-[10px] sm:text-xs md:text-sm text-text-secondary mb-1.5 pl-1 shadow-text-sm" data-text="API Key">API Key</label>
          <Input
            id="apiKey"
            name="apiKey"
            type="password"
            value={formData.apiKey}
            onChange={handleChange}
            placeholder="Sua API Key"
            error={!!localErrors.apiKey}
            disabled={isLoading}
            size="default"
            className="w-full"
          />
          {localErrors.apiKey && <p className="text-error text-[9px] sm:text-[10px] md:text-xs mt-1 pl-1 break-words shadow-text-sm" data-text={localErrors.apiKey}>{localErrors.apiKey}</p>}
        </div>

        <div>
          <label htmlFor="apiSecret" className="block text-[10px] sm:text-xs md:text-sm text-text-secondary mb-1.5 pl-1 shadow-text-sm" data-text="API Secret">API Secret</label>
          <Input
            id="apiSecret"
            name="apiSecret"
            type="password"
            value={formData.apiSecret}
            onChange={handleChange}
            placeholder="Seu API Secret"
            error={!!localErrors.apiSecret}
            disabled={isLoading}
            size="default"
            className="w-full"
          />
          {localErrors.apiSecret && <p className="text-error text-[9px] sm:text-[10px] md:text-xs mt-1 pl-1 break-words shadow-text-sm" data-text={localErrors.apiSecret}>{localErrors.apiSecret}</p>}
        </div>

        <div>
          <label htmlFor="passphrase" className="block text-[10px] sm:text-xs md:text-sm text-text-secondary mb-1.5 pl-1 shadow-text-sm" data-text="Passphrase">Passphrase</label>
          <Input
            id="passphrase"
            name="passphrase"
            type="password"
            value={formData.passphrase || ''}
            onChange={handleChange}
            placeholder="Sua Passphrase (LNMarkets)"
            error={!!localErrors.passphrase}
            disabled={isLoading}
            size="default"
            className="w-full"
          />
          {localErrors.passphrase && <p className="text-error text-[9px] sm:text-[10px] md:text-xs mt-1 pl-1 break-words shadow-text-sm" data-text={localErrors.passphrase}>{localErrors.passphrase}</p>}
        </div>

        {localErrors.submit && (
          <div className="flex items-start text-error text-[9px] sm:text-[10px] md:text-xs p-2 bg-error/10 rounded-md shadow-text-sm" data-text={localErrors.submit}>
            <AlertTriangle size={14} className="mr-2 flex-shrink-0 mt-0.5" /> 
            <span className="break-words">{localErrors.submit}</span>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading} 
          variant="success" 
          size="lg"
        >
          Conectar Owner API
        </Button>
      </form>
    </Card>
  );
};

export default OwnerStep; 