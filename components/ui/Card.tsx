'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  variant?: 'default' | 'depth' | 'glow';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, as: Component = 'div', variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'shadow-lg',
      depth: 'shadow-depth light-glow',
      glow: 'shadow-depth light-glow inner-glow'
    };

    return (
      <Component
        ref={ref}
        className={twMerge(
          'bg-bg-secondary border border-bg-tertiary rounded-lg p-6 shadow-transition font-press-start text-text-primary',
          variantClasses[variant],
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