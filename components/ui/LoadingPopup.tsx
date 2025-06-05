'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

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
    <div className="loading-overlay">
      <div 
        className={twMerge(
          'loading-content',
          className
        )}
      >
        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 animate-spin text-text-primary mb-4" />
        <p 
          className="text-responsive-base text-text-primary text-center shadow-text-sm text-shadow-hover uppercase tracking-wider"
          data-text={message}
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export { LoadingPopup }; 