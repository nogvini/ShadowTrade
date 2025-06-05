'use client';

import React from 'react';
import { useAppState } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link2, CheckCircle2, Settings, AlertTriangle, Edit3, Trash2 } from 'lucide-react'; // Ícone Link2 para Slave
import { twMerge } from 'tailwind-merge';

const SlaveStep: React.FC = () => {
  const { slaveConfig, openModal, isLoading, errors, resetSlaveConfig } = useAppState();

  const handleOpenModal = () => {
    if (!isLoading) {
      openModal('slave');
    }
  };

  const handleEdit = () => {
    openModal('slave');
  };

  const handleRemove = () => {
    // Implemente a lógica para remover o slave
  };

  const cardBaseClasses = 'w-full flex-1 min-h-[250px] md:min-h-[300px] flex flex-col justify-center items-center text-center p-4 sm:p-6 relative';
  const slaveEffectClasses = 'shadow-depth-active light-glow inner-glow shadow-transition'; // Efeito ativo com luz
  const inactiveEffectClasses = 'shadow-depth light-glow shadow-transition hover:shadow-depth-hover'; // Efeito inativo com hover

  if (slaveConfig && slaveConfig.isConnected) {
    return (
      <Card 
        className={twMerge(
          cardBaseClasses,
          slaveEffectClasses,
          'bg-bg-secondary border-success' // Fundo escuro com destaque verde
        )}
      >
        <CheckCircle2 size={40} className="text-success mb-3" />
        <h3 
          className="text-sm sm:text-lg font-semibold mb-2 text-text-primary shadow-text-lg text-shadow-hover uppercase tracking-wider"
          data-text="Slave Ativa"
        >
          Slave Ativa
        </h3>
        <p className="text-[10px] sm:text-xs text-text-secondary mb-1 break-all shadow-text-sm" data-text={`API Key: ${slaveConfig.maskedApiKey}`}>
          API Key: {slaveConfig.maskedApiKey}
        </p>
        <p className="text-[10px] sm:text-xs text-text-secondary mb-4 shadow-text-sm" data-text={`Quantidade: $${slaveConfig.amount.toLocaleString()}`}>
          Quantidade: ${slaveConfig.amount.toLocaleString()}
        </p>
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
      <Link2 size={40} className="text-text-secondary group-hover:text-text-primary mb-3 transition-colors text-shadow-hover" />
      <h3 
        className="text-sm sm:text-lg font-semibold mb-2 text-text-secondary group-hover:text-text-primary transition-colors shadow-text-lg text-shadow-hover uppercase tracking-wider"
        data-text="Slave Account"
      >
        Slave Account
      </h3>
      <p className="text-[10px] sm:text-xs text-text-secondary/80 mb-4 group-hover:text-text-secondary px-2 sm:px-0 shadow-text-sm text-shadow-hover" data-text="Clique para configurar sua conta Slave.">
        Clique para configurar sua conta Slave.
      </p>
      <Button 
        variant="secondary" 
        size="sm" 
        icon={Settings}
        disabled={isLoading}
        className="group-hover:bg-text-primary group-hover:text-bg-primary transition-colors w-full sm:w-auto text-[9px] sm:text-[10px]"
      >
        {isLoading ? 'Aguarde...' : 'Configurar Slave'}
      </Button>
      {errors.slaveSubmit && (
        <p className="text-error text-[9px] sm:text-[10px] mt-3 absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 break-words shadow-text-sm">{errors.slaveSubmit}</p>
      )}
    </Card>
  );
};

export default SlaveStep; 