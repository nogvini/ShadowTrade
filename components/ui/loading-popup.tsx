'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingPopupProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

const LoadingPopup: React.FC<LoadingPopupProps> = ({ 
  isVisible, 
  message = 'Carregando...', 
  className 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg-primary/90 backdrop-blur-sm" />
      
      {/* Loading Content */}
      <div className={cn(
        'relative bg-bg-secondary border border-bg-tertiary rounded-lg p-8 shadow-depth light-glow inner-glow font-press-start text-center',
        className
      )}>
        {/* Spinner */}
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-text-primary border-t-transparent"></div>
        </div>
        
        {/* Message */}
        <p className="text-sm text-text-primary shadow-text-sm uppercase tracking-wider">
          <span className="shadow-text-sm" data-text={message}>
            {message}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoadingPopup; 