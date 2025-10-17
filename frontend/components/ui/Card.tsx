import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight' | 'glass' | 'elevated' | 'glow' | 'gradient'
  hover?: boolean
  glow?: boolean
}

export function Card({
  children,
  variant = 'default',
  hover = false,
  glow = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-6 md:p-8 transition-all duration-300',
        {
          'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-lg':
            variant === 'default',
          'bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 border-2 border-purple-300 dark:border-purple-600 shadow-xl':
            variant === 'highlight',
          'bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl':
            variant === 'glass',
          'bg-white dark:bg-slate-800 shadow-2xl border-0':
            variant === 'elevated',
          'bg-white dark:bg-slate-900 border-2 border-purple-500/50 dark:border-purple-500/30 shadow-[0_0_30px_rgba(124,58,237,0.2)] dark:shadow-[0_0_40px_rgba(124,58,237,0.3)]':
            variant === 'glow',
          'bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 text-white shadow-2xl border-0':
            variant === 'gradient',
          'hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] cursor-pointer': hover,
          'card-glow': glow,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ children, className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn('text-2xl font-bold text-gray-900 dark:text-white mb-2', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({
  children,
  className,
  ...props
}: CardDescriptionProps) {
  return (
    <p className={cn('text-gray-600 dark:text-gray-400', className)} {...props}>
      {children}
    </p>
  )
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={cn('mb-6', className)} {...props}>
      {children}
    </div>
  )
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div className={cn('mt-auto', className)} {...props}>
      {children}
    </div>
  )
}
