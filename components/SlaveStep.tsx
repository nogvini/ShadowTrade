'use client';

import React from 'react';
import { useAppState } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link2, CheckCircle2, Settings, AlertTriangle, Edit3 } from 'lucide-react'; // Ícone Link2 para Slave
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

  const cardBaseClasses = 'w-full flex-1 min-h-[250px] md:min-h-[300px] flex flex-col justify-center items-center text-center p-6 relative transition-all duration-300 ease-smooth overflow-hidden'; // overflow-hidden para a animação da corrente não sair do card
  
  // Efeito de borda picotada/corrente - usando repeating-linear-gradient no border-image
  // A animação "rodeando" é mais complexa e pode precisar de SVGs ou pseudo-elementos com JS.
  // Por ora, vamos focar na borda estática e uma animação de "chainMove" no topo.
  const chainBorderEffect = 'border-[3px] border-transparent border-dashed'; // Estilo base para a borda
  // A animação de corrente no topo será um elemento separado.

  if (slaveConfig && slaveConfig.isConnected) {
    return (
      <Card 
        className={twMerge(
          cardBaseClasses,
          chainBorderEffect,
          'border-success',
          'shadow-glow-success' // Adicionar efeito de glow
        )}
      >
        {/* Animação de corrente decorativa no topo - placeholder */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-bg-tertiary overflow-hidden">
          <div className="w-full h-full animate-chainMove relative">
            {/* Simulação de elos de corrente */}
            {[...Array(20)].map((_, i) => (
              <span key={i} className="inline-block h-1.5 w-2 bg-text-secondary/50 rounded-full mr-1" style={{ animationDelay: `${i * 0.1}s`}}></span>
            ))}
          </div>
        </div>

        <CheckCircle2 size={40} className="text-success mb-3 mt-4" /> {/* mt-4 para dar espaço à animação de corrente */}
        <h3 className="text-lg font-semibold mb-2 text-text-primary uppercase tracking-wider">Slave Ativa</h3>
        <p className="text-xs text-text-secondary mb-1">
          API Key: {slaveConfig.maskedApiKey}
        </p>
        <p className="text-xs text-text-secondary mb-4">
          Quantidade: ${slaveConfig.amount.toLocaleString()}
        </p>
        <div className="flex gap-3">
          <Button onClick={handleEdit} variant="outline" size="sm" icon={Edit3}>
            Editar
          </Button>
          <Button onClick={() => resetSlaveConfig()} variant="destructive" size="sm" icon={AlertTriangle} className="opacity-80 hover:opacity-100">
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
        chainBorderEffect, // Borda picotada/corrente inicial
        'border-bg-tertiary hover:border-text-primary/70 hover:shadow-xl cursor-pointer group'
      )}
      onClick={handleOpenModal}
    >
      <Link2 size={40} className="text-text-secondary group-hover:text-text-primary mb-3 transition-colors" />
      <h3 className="text-lg font-semibold mb-2 text-text-secondary group-hover:text-text-primary transition-colors uppercase tracking-wider">
        Slave Account
      </h3>
      <p className="text-xs text-text-secondary/80 mb-4 group-hover:text-text-secondary">
        Clique para configurar sua conta Slave.
      </p>
      <Button 
        variant="secondary" 
        size="sm" 
        icon={Settings}
        disabled={isLoading}
        className="group-hover:bg-text-primary group-hover:text-bg-primary transition-colors"
      >
        {isLoading ? 'Aguarde...' : 'Configurar Slave'}
      </Button>
      {errors.slaveSubmit && (
        <p className="text-error text-[10px] mt-3 absolute bottom-4 left-4 right-4">{errors.slaveSubmit}</p>
      )}
    </Card>
  );
};

export default SlaveStep; 