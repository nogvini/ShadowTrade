'use client';

import React from 'react';
import { useAppState } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, CheckCircle2, Settings, AlertTriangle, Edit3, Trash2 } from 'lucide-react'; // Ícone Users para Shadow, Settings para configurar
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

  const handleRemove = () => {
    // Implemente a lógica para remover o shadow
  };

  const cardBaseClasses = 'w-full flex-1 min-h-[250px] md:min-h-[300px] flex flex-col justify-center items-center text-center p-4 sm:p-6 relative';
  const shadowEffectClasses = 'shadow-depth-active light-glow inner-glow shadow-transition'; // Efeito ativo com luz
  const inactiveEffectClasses = 'shadow-depth light-glow shadow-transition hover:shadow-depth-hover'; // Efeito inativo com hover

  if (shadowConfig && shadowConfig.isConnected) {
    return (
      <Card 
        className={twMerge(
          cardBaseClasses,
          shadowEffectClasses,
          'bg-bg-secondary border-success' // Fundo escuro com destaque verde
        )}
      >
        <CheckCircle2 size={40} className="text-success mb-3" />
        <h3 
          className="text-sm sm:text-lg font-semibold mb-2 text-text-primary shadow-text-lg text-shadow-hover uppercase tracking-wider"
          data-text="Shadow Ativa"
        >
          Shadow Ativa
        </h3>
        <p className="text-[10px] sm:text-xs text-text-secondary mb-1 break-all shadow-text-sm" data-text={`API Key: ${shadowConfig.maskedApiKey}`}>
          API Key: {shadowConfig.maskedApiKey}
        </p>
        <p className="text-[10px] sm:text-xs text-text-secondary mb-1 shadow-text-sm" data-text={`Quantidade: $${shadowConfig.amount.toLocaleString()}`}>
          Quantidade: ${shadowConfig.amount.toLocaleString()}
        </p>
        {shadowConfig.shadowClose && (
          <p className="text-[10px] sm:text-xs text-text-secondary mb-1 shadow-text-sm" data-text="Shadow Close: Ativado">Shadow Close: Ativado</p>
        )}
        {!shadowConfig.shadowClose && shadowConfig.takeProfit !== undefined && (
          <p className="text-[10px] sm:text-xs text-text-secondary mb-1 shadow-text-sm" data-text={`Take Profit: ${shadowConfig.takeProfit}%`}>Take Profit: {shadowConfig.takeProfit}%</p>
        )}
        <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button onClick={handleEdit} variant="outline" size="sm" icon={Edit3} className="w-full sm:w-auto text-[9px] sm:text-[10px]">
            Editar
          </Button>
          <Button onClick={handleRemove} variant="destructive" size="sm" icon={Trash2} className="w-full sm:w-auto text-[9px] sm:text-[10px]">
            Remover
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={twMerge(
        cardBaseClasses,
        inactiveEffectClasses,
        'bg-bg-secondary border-bg-tertiary cursor-pointer group'
      )}
      onClick={handleOpenModal}
    >
      <Users size={40} className="text-text-secondary group-hover:text-text-primary mb-3 transition-colors text-shadow-hover" />
      <h3 
        className="text-sm sm:text-lg font-semibold mb-2 text-text-secondary group-hover:text-text-primary transition-colors shadow-text-lg text-shadow-hover uppercase tracking-wider"
        data-text="Shadow Account"
      >
        Shadow Account
      </h3>
      <p className="text-[10px] sm:text-xs text-text-secondary/80 mb-4 group-hover:text-text-secondary px-2 sm:px-0 shadow-text-sm text-shadow-hover" data-text="Clique para configurar sua conta Shadow.">
        Clique para configurar sua conta Shadow.
      </p>
      <Button 
        variant="secondary" 
        size="sm" 
        icon={Settings}
        disabled={isLoading}
        className="group-hover:bg-text-primary group-hover:text-bg-primary transition-colors w-full sm:w-auto text-[9px] sm:text-[10px]"
      >
        {isLoading ? 'Aguarde...' : 'Configurar Shadow'}
      </Button>
      {errors.shadowSubmit && (
        <p className="text-error text-[9px] sm:text-[10px] mt-3 absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 break-words shadow-text-sm">{errors.shadowSubmit}</p>
      )}
    </Card>
  );
};

export default ShadowStep; 