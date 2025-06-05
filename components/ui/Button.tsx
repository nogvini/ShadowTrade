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
        default: 'h-8 sm:h-9 md:h-10 px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] md:text-xs',
        sm: 'h-7 sm:h-8 md:h-9 rounded-md px-2 sm:px-3 text-[8px] sm:text-[9px] md:text-[10px]',
        lg: 'h-9 sm:h-10 md:h-11 rounded-md px-6 sm:px-8 text-[10px] sm:text-xs md:text-sm',
        icon: 'h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10',
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
  shadowText?: boolean;
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
      shadowText = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? 'span' : 'button'; // Use span if asChild to pass props to child
    
    // Extract text content for shadow effect, handling complex children
    const extractTextContent = (children: React.ReactNode): string => {
      if (typeof children === 'string') return children;
      if (typeof children === 'number') return children.toString();
      if (React.isValidElement(children) && typeof children.props.children === 'string') {
        return children.props.children;
      }
      return '';
    };
    
    const textContent = extractTextContent(children);

    return (
      <Comp
        className={twMerge(
          buttonVariants({ variant, size }), 
          shadowText && textContent && 'shadow-text-button',
          className
        )}
        ref={ref}
        disabled={isLoading || disabled}
        data-text={shadowText && textContent ? textContent : undefined}
        {...props}
      >
        {isLoading && <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />}
        {!isLoading && Icon && iconPosition === 'left' && (
          <Icon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        )}
        {children}
        {!isLoading && Icon && iconPosition === 'right' && (
          <Icon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants }; 