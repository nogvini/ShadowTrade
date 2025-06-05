'use client';

import React, { useState } from 'react';
import { useAppState } from '@/contexts/AppContext';
import { CheckCircle2, Circle, Loader2, Edit3 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface StepProps {
  label: string;
  status: 'completed' | 'active' | 'pending' | 'loading';
  className?: string;
  onClick?: () => void;
  isInteractive?: boolean;
  showEditIcon?: boolean;
}

const Step: React.FC<StepProps> = ({ label, status, className, onClick, isInteractive, showEditIcon }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const Icon = 
    status === 'completed' ? CheckCircle2 :
    status === 'loading' ? Loader2 :
    Circle;
  
  const iconColor = 
    status === 'completed' ? 'text-success' :
    status === 'active' || status === 'loading' ? 'text-text-primary' :
    'text-text-secondary/50';

  return (
    <div 
      className={twMerge(
        'flex flex-col items-center text-center transition-all duration-300 ease-smooth relative group',
        (isInteractive && status !== 'loading') && 'cursor-pointer hover:scale-105',
        className
      )}
      onClick={isInteractive && status !== 'loading' ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Container do ícone principal com overlay de edição */}
      <div className="relative">
        <Icon 
          size={16} 
          className={twMerge(
            iconColor, 
            'sm:w-5 sm:h-5 md:w-6 md:h-6 transition-all duration-300',
            status === 'loading' && 'animate-spin',
            status === 'active' && 'animate-pulse',
            isInteractive && isHovered && 'scale-110'
          )} 
        />
        
        {/* Ícone de edição que aparece no hover */}
        {showEditIcon && isInteractive && isHovered && (
          <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-bg-secondary border border-success rounded-full p-0.5 sm:p-1 shadow-lg animate-pulse">
            <Edit3 size={8} className="text-success sm:w-2.5 sm:h-2.5" />
          </div>
        )}
      </div>
      
      <p className={twMerge(
        'mt-1 sm:mt-1.5 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider text-center leading-tight px-1 transition-all duration-300 shadow-text-sm',
        status === 'active' || status === 'loading' ? 'text-text-primary font-semibold' : 'text-text-secondary',
        isInteractive && isHovered && status === 'completed' && 'text-success font-semibold'
      )}
      data-text={label}
      >
        {label}
      </p>
      
      {/* Tooltip de edição */}
      {showEditIcon && isInteractive && isHovered && (
        <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 bg-bg-secondary border border-success rounded px-1.5 py-0.5 sm:px-2 sm:py-1 shadow-lg z-20 min-w-max">
          <p className="text-[6px] sm:text-[8px] text-success whitespace-nowrap uppercase tracking-wider">
            Clique para editar
          </p>
          {/* Seta do tooltip */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
            <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-success"></div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProgressIndicator: React.FC = () => {
  const { ownerConfig, isOwnerConfigured, isLoading, currentStep, resetOwnerConfig } = useAppState();

  const ownerStatus =
    isLoading && currentStep === 1 && !ownerConfig ? 'loading' :
    isOwnerConfigured ? 'completed' :
    currentStep === 1 ? 'active' :
    'pending';

  // A etapa 2 (Shadow/Slave) fica ativa ou pendente dependendo se o Owner está configurado.
  // Se o owner estiver sendo configurado (isLoading), a etapa 2 permanece pendente.
  const accountsStatus =
    isLoading && currentStep === 2 ? 'loading' :
    isOwnerConfigured && currentStep === 2 ? 'active' :
    'pending';
    
  const pyramidLayout = isOwnerConfigured;

  // Função para editar o Owner
  const handleEditOwner = () => {
    if (isOwnerConfigured && !isLoading) {
      resetOwnerConfig();
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg my-4 sm:my-6 md:my-10 font-press-start px-2 sm:px-0">
      <div className={twMerge(
        'flex items-start justify-center',
        pyramidLayout ? 'flex-col items-center gap-2 sm:gap-4' : 'gap-4 sm:gap-6 md:gap-8 lg:gap-12' 
      )}>
        {/* Etapa 1: Owner API */}
        <div className={twMerge(
          'flex flex-col items-center relative',
          pyramidLayout ? 'w-auto' : 'flex-1'
        )}>
          <Step 
            label="Owner API" 
            status={ownerStatus} 
            isInteractive={ownerStatus === 'completed'}
            showEditIcon={ownerStatus === 'completed'}
            onClick={handleEditOwner}
          />
          {pyramidLayout && (
            <div className="mt-1 sm:mt-2 h-4 sm:h-6 w-px bg-bg-tertiary self-center" />
          )}
        </div>

        {!pyramidLayout && (
          <div className="flex-shrink-0 self-center h-px w-8 sm:w-12 md:w-16 bg-bg-tertiary mt-2 sm:mt-2.5" />
        )}

        {/* Etapa 2: Shadow & Slave - Visível como agrupada ou separada no layout pirâmide */}
        <div className={twMerge(
          'flex items-start',
          pyramidLayout ? 'w-full justify-around' : 'flex-col items-center flex-1'
        )}>
          {pyramidLayout ? (
            <>
              <Step 
                label="Shadow Account" 
                status={accountsStatus} // Simplificado, poderia ter estados individuais
                className="flex-1"
              />
              <div className="flex-shrink-0 self-start h-px w-6 sm:w-8 md:w-12 bg-bg-tertiary mt-2 sm:mt-2.5 mx-1 sm:mx-2" />
              <Step 
                label="Slave Account" 
                status={accountsStatus} // Simplificado
                className="flex-1"
              />
            </>
          ) : (
            <Step 
              label="Shadow & Slave Accounts" 
              status={accountsStatus} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator; 