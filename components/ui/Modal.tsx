'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button'; // Assumindo que Button.tsx está em ui
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  hideCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const modalSizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full h-full md:h-auto',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  contentClassName,
  hideCloseButton = false,
  size = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus trap logic can be added here if needed
      // For now, just focus the modal itself for accessibility
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      tabIndex={-1} // Make it focusable
      className={twMerge(
        'fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-2 sm:p-4 font-press-start transition-opacity duration-300 ease-smooth',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className
      )}
      onClick={onClose} // Close on overlay click
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={twMerge(
          'relative bg-bg-secondary text-text-primary border border-bg-tertiary shadow-2xl rounded-lg p-3 sm:p-6 md:p-8 w-full flex flex-col max-h-[95vh] sm:max-h-[90vh]',
          modalSizeClasses[size],
          contentClassName
        )}
        onClick={(e) => e.stopPropagation()} // Prevent close on content click
      >
        {!hideCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 sm:top-3 sm:right-3 text-text-secondary hover:text-text-primary z-10"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={16} className="sm:w-[18px] sm:h-[18px]" />
          </Button>
        )}
        {title && (
          <h2
            id="modal-title"
            className="text-xs sm:text-sm md:text-base font-semibold mb-3 sm:mb-4 pr-6 sm:pr-8 text-text-primary uppercase tracking-wider shadow-text-sm"
            data-text={title}
          >
            {title}
          </h2>
        )}
        <div className="flex-grow overflow-y-auto pr-1 sm:pr-2 -mr-1 sm:-mr-2 scrollbar-thin scrollbar-thumb-bg-tertiary scrollbar-track-bg-secondary">
          {children}
        </div>
      </div>
    </div>
  );
};

export { Modal }; 