'use client';

import React from 'react';
import { LucideProps, Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'font-press-start inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs ring-offset-background transition-all duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wider shadow-md hover:shadow-lg active:shadow-sm',
  {
    variants: {
      variant: {
        default:
          'bg-text-primary text-bg-primary hover:bg-text-primary/90',
        destructive:
          'bg-error text-text-primary hover:bg-error/90',
        outline:
          'border border-text-primary bg-transparent text-text-primary hover:bg-text-primary hover:text-bg-primary',
        secondary:
          'bg-bg-secondary text-text-primary hover:bg-bg-secondary/80',
        ghost:
          'hover:bg-bg-tertiary hover:text-text-secondary shadow-none',
        link:
          'text-text-primary underline-offset-4 hover:underline shadow-none',
        success:
          'bg-success text-bg-primary hover:bg-success/90',
      },
      size: {
        default: 'h-10 px-4 py-2 text-[10px] md:text-xs',
        sm: 'h-9 rounded-md px-3 text-[9px] md:text-[10px]',
        lg: 'h-11 rounded-md px-8 text-xs md:text-sm',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  icon?: React.ComponentType<LucideProps>;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      disabled = false,
      icon: Icon,
      iconPosition = 'left',
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? 'span' : 'button'; // Use span if asChild to pass props to child

    return (
      <Comp
        className={twMerge(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && Icon && iconPosition === 'left' && (
          <Icon className="mr-2 h-4 w-4" />
        )}
        {children}
        {!isLoading && Icon && iconPosition === 'right' && (
          <Icon className="ml-2 h-4 w-4" />
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants }; 