'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-press-start transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase tracking-wider shadow-text-sm',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-text-primary text-bg-primary hover:bg-text-primary/80',
        secondary:
          'border-transparent bg-bg-secondary text-text-secondary hover:bg-bg-secondary/80',
        destructive:
          'border-transparent bg-error text-text-primary hover:bg-error/80',
        success:
          'border-transparent bg-success text-bg-primary hover:bg-success/80',
        outline: 'text-text-primary border-text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants }; 