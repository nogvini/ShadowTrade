'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg-primary/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        'relative bg-bg-secondary border border-bg-tertiary rounded-lg shadow-depth light-glow max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto font-press-start',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-bg-tertiary">
          <h2 className="text-lg font-press-start text-text-primary shadow-text-sm uppercase tracking-wider">
            <span className="shadow-text-sm" data-text={title}>
              {title}
            </span>
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 