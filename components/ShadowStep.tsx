'use client';

import React from 'react';
import { useAppState } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, CheckCircle2, Settings, AlertTriangle, Edit3 } from 'lucide-react'; // Ícone Users para Shadow, Settings para configurar
import { twMerge } from 'tailwind-merge';

const ShadowStep: React.FC = () => {
  const { shadowConfig, openModal, isLoading, errors, resetShadowConfig } = useAppState();

  const handleOpenModal = () => {
    if (!isLoading) {
      openModal('shadow');
    }
  };

  const handleEdit = () => {
    // A lógica de edição pode simplesmente reabrir o modal
    // Os dados atuais já estarão no modal através do AppContext
    openModal('shadow');
  };

  const cardBaseClasses = 'w-full flex-1 min-h-[250px] md:min-h-[300px] flex flex-col justify-center items-center text-center p-6 relative transition-all duration-300 ease-smooth';
  const shadowEffectClasses = 'border-l-4 border-success shadow-[-4px_0_12px_0_rgba(74,222,128,0.2),_0_4px_6px_-1px_rgba(0,0,0,0.1),_0_2px_4px_-2px_rgba(0,0,0,0.1)]'; // Sombra customizada para o efeito esquerdo e geral

  if (shadowConfig && shadowConfig.isConnected) {
    return (
      <Card 
        className={twMerge(
          cardBaseClasses,
          shadowEffectClasses,
          'border-success' // Borda verde geral quando conectado
        )}
      >
        <CheckCircle2 size={40} className="text-success mb-3" />
        <h3 
          className="text-lg font-semibold mb-2 text-text-primary shadow-text uppercase tracking-wider"
          data-text="Shadow"
        >
          Shadow Ativa
        </h3>
        <p className="text-xs text-text-secondary mb-1">
          API Key: {shadowConfig.maskedApiKey}
        </p>
        <p className="text-xs text-text-secondary mb-1">
          Quantidade: ${shadowConfig.amount.toLocaleString()}
        </p>
        {shadowConfig.shadowClose && (
          <p className="text-xs text-text-secondary mb-1">Shadow Close: Ativado</p>
        )}
        {!shadowConfig.shadowClose && shadowConfig.takeProfit !== undefined && (
          <p className="text-xs text-text-secondary mb-1">Take Profit: {shadowConfig.takeProfit}%</p>
        )}
        <div className="mt-6 flex gap-3">
          <Button onClick={handleEdit} variant="outline" size="sm" icon={Edit3}>
            Editar
          </Button>
           <Button onClick={() => resetShadowConfig()} variant="destructive" size="sm" icon={AlertTriangle} className="opacity-80 hover:opacity-100">
            Desconectar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={twMerge(
        cardBaseClasses,
        'border-2 border-dashed border-bg-tertiary hover:border-text-primary/70 hover:shadow-xl cursor-pointer group'
      )}
      onClick={handleOpenModal}
    >
      <Users size={40} className="text-text-secondary group-hover:text-text-primary mb-3 transition-colors" />
      <h3 
        className="text-lg font-semibold mb-2 text-text-secondary group-hover:text-text-primary transition-colors shadow-text uppercase tracking-wider"
        data-text="Shadow"
      >
        Shadow Account
      </h3>
      <p className="text-xs text-text-secondary/80 mb-4 group-hover:text-text-secondary">
        Clique para configurar sua conta Shadow.
      </p>
      <Button 
        variant="secondary" 
        size="sm" 
        icon={Settings}
        disabled={isLoading}
        className="group-hover:bg-text-primary group-hover:text-bg-primary transition-colors"
      >
        {isLoading ? 'Aguarde...' : 'Configurar Shadow'}
      </Button>
      {errors.shadowSubmit && (
        <p className="text-error text-[10px] mt-3 absolute bottom-4 left-4 right-4">{errors.shadowSubmit}</p>
      )}
    </Card>
  );
};

export default ShadowStep; 