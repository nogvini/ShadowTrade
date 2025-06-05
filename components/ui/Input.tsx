'use client';

import * as React from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={twMerge(
          'font-press-start flex h-8 sm:h-9 md:h-10 w-full rounded-md border border-bg-tertiary bg-bg-secondary px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-text-primary ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 ease-smooth',
          error && 'border-error focus-visible:ring-error',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input }; 