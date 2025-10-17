import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'new' | 'popular' | 'beta' | 'savings'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  pulse = false,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold transition-all duration-200',
        {
          // Variants
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200':
            variant === 'neutral',
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400':
            variant === 'success',
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400':
            variant === 'warning',
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400':
            variant === 'danger',
          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400':
            variant === 'info',
          'bg-emerald-600 text-white shadow-lg animate-glow-pulse':
            variant === 'new',
          'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl font-bold uppercase tracking-wide':
            variant === 'popular',
          'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-300 dark:border-purple-700':
            variant === 'beta',
          'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg font-bold':
            variant === 'savings',
          // Sizes
          'px-2 py-0.5 text-[10px]': size === 'sm',
          'px-2.5 py-0.5 text-xs': size === 'md',
          'px-3 py-1 text-sm': size === 'lg',
          // Pulse animation
          'animate-pulse': pulse,
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
