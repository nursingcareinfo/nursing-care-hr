import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default' | 'on-shift' | 'offline'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      success: 'bg-primary-fixed text-primary rounded-full',
      warning: 'bg-secondary-container text-secondary-on-container rounded-full',
      error: 'bg-error-container text-error-on-container rounded-full',
      info: 'bg-secondary-fixed text-secondary-on-fixed rounded-full',
      default: 'bg-surface-variant text-on-surface-variant rounded-full',
      'on-shift': 'bg-on-shift text-white rounded-full',
      'offline': 'bg-offline text-on-surface rounded-full'
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
export type { BadgeProps }
