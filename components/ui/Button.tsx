'use client';

import React from 'react';
import { LucideProps } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'font-press-start inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-all duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wider shadow-md hover:shadow-lg active:shadow-sm',
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
        xs: 'h-6 sm:h-7 px-2 sm:px-3 text-[7px] sm:text-[8px] md:text-[9px]',
        sm: 'h-7 sm:h-8 md:h-9 px-2 sm:px-3 md:px-4 text-[8px] sm:text-[9px] md:text-[10px]',
        default: 'h-8 sm:h-9 md:h-10 lg:h-11 px-3 sm:px-4 md:px-6 text-[9px] sm:text-[10px] md:text-xs lg:text-sm',
        lg: 'h-10 sm:h-11 md:h-12 lg:h-14 px-6 sm:px-8 md:px-10 text-[10px] sm:text-xs md:text-sm lg:text-base',
        xl: 'h-12 sm:h-14 md:h-16 px-8 sm:px-12 text-xs sm:text-sm md:text-base',
        icon: 'h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11',
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

    // Dynamic icon sizing based on button size
    const getIconSize = () => {
      switch (size) {
        case 'xs': return 'h-2 w-2 sm:h-3 sm:w-3';
        case 'sm': return 'h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4';
        case 'lg': return 'h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6';
        case 'xl': return 'h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7';
        default: return 'h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5';
      }
    };

    return (
      <Comp
        className={twMerge(
          buttonVariants({ variant, size }), 
          shadowText && textContent && 'shadow-text-button',
          className
        )}
        ref={ref}
        disabled={disabled}
        data-text={shadowText && textContent ? textContent : undefined}
        {...props}
      >
        {Icon && iconPosition === 'left' && (
          <Icon className={twMerge(getIconSize(), 'mr-1 sm:mr-2')} />
        )}
        {children}
        {Icon && iconPosition === 'right' && (
          <Icon className={twMerge(getIconSize(), 'ml-1 sm:ml-2')} />
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants }; 