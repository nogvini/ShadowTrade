'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  // Adicione variantes se necessário no futuro, ex: variant: 'owner' | 'shadow' | 'slave'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, as: Component = 'div', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={twMerge(
          'bg-bg-secondary border border-bg-tertiary rounded-lg p-6 shadow-lg transition-all duration-300 ease-smooth font-press-start text-text-primary',
          // Exemplo de como adicionar estilos baseados em props no futuro:
          // variant === 'shadow' && 'border-l-4 border-success shadow-glow-success',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

export { Card }; 