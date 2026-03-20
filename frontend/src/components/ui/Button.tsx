'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-primary-on rounded-xl hover:bg-primary-container shadow-ambient',
      secondary: 'bg-secondary-fixed-dim text-secondary-on-fixed rounded-xl hover:bg-secondary-fixed',
      ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container-low rounded-xl',
      danger: 'bg-error text-error-on rounded-xl hover:bg-error-container'
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg'
    }

    return (
      <button
        ref={ref}
        className={cn(
          'font-medium transition-all duration-200 inline-flex items-center justify-center gap-2',
          variants[variant],
          sizes[size],
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
