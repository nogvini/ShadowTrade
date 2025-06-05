'use client';

import React from 'react';
import { useAppState } from '@/contexts/AppContext';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface StepProps {
  label: string;
  status: 'completed' | 'active' | 'pending' | 'loading';
  className?: string;
  onClick?: () => void;
  isInteractive?: boolean;
}

const Step: React.FC<StepProps> = ({ label, status, className, onClick, isInteractive }) => {
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
        'flex flex-col items-center text-center transition-all duration-300 ease-smooth',
        (isInteractive && status !== 'loading') && 'cursor-pointer hover:opacity-80',
        className
      )}
      onClick={isInteractive && status !== 'loading' ? onClick : undefined}
    >
      <Icon 
        size={20} 
        className={twMerge(
          iconColor, 
          status === 'loading' && 'animate-spin',
          status === 'active' && 'animate-pulse'
        )} 
      />
      <p className={twMerge(
        'mt-1.5 text-[10px] md:text-xs uppercase tracking-wider',
        status === 'active' || status === 'loading' ? 'text-text-primary font-semibold' : 'text-text-secondary'
      )}>
        {label}
      </p>
    </div>
  );
};

const ProgressIndicator: React.FC = () => {
  const { ownerConfig, isOwnerConfigured, isLoading, currentStep } = useAppState();

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

  return (
    <div className="w-full max-w-md md:max-w-lg my-6 md:my-10 font-press-start">
      <div className={twMerge(
        'flex items-start justify-center',
        pyramidLayout ? 'flex-col items-center gap-4' : 'gap-8 md:gap-12' 
      )}>
        {/* Etapa 1: Owner API */}
        <div className={twMerge(
          'flex flex-col items-center relative',
          pyramidLayout ? 'w-auto' : 'flex-1'
        )}>
          <Step 
            label="Owner API" 
            status={ownerStatus} 
          />
          {pyramidLayout && (
            <div className="mt-2 h-6 w-px bg-bg-tertiary self-center" />
          )}
        </div>

        {!pyramidLayout && (
          <div className="flex-shrink-0 self-center h-px w-12 md:w-16 bg-bg-tertiary mt-2.5" />
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
              <div className="flex-shrink-0 self-start h-px w-12 md:w-16 bg-bg-tertiary mt-2.5 mx-2" />
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