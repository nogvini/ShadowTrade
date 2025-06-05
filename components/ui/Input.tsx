'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const inputVariants = cva(
  'font-press-start flex w-full rounded-md border bg-bg-secondary ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 ease-smooth text-text-primary',
  {
    variants: {
      size: {
        xs: 'h-6 sm:h-7 px-2 py-1 text-[8px] sm:text-[9px]',
        sm: 'h-7 sm:h-8 px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-[10px]',
        default: 'h-8 sm:h-9 md:h-10 lg:h-11 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-[10px] sm:text-xs md:text-sm',
        lg: 'h-10 sm:h-11 md:h-12 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base',
      },
      variant: {
        default: 'border-bg-tertiary',
        error: 'border-error focus-visible:ring-error',
        success: 'border-success focus-visible:ring-success',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, variant, error, ...props }, ref) => {
    const finalVariant = error ? 'error' : variant;

    return (
      <input
        type={type}
        className={twMerge(
          inputVariants({ size, variant: finalVariant }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants }; 