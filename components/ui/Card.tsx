'use client';

import React from 'react';
import { cn } from '../../lib/utils';

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
        className={cn(
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

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 font-press-start", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg sm:text-xl font-press-start leading-none tracking-tight text-text-primary shadow-text-sm uppercase",
      className
    )}
    {...props}
  >
    <span className="shadow-text-sm" data-text={children}>
      {children}
    </span>
  </h3>
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs sm:text-sm text-text-secondary font-press-start mt-2", className)}
    {...props}
  >
    {children}
  </p>
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 font-press-start", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 font-press-start", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }; 