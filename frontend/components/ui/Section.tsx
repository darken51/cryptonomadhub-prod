import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string
  subtitle?: string
  actions?: ReactNode
  variant?: 'default' | 'muted' | 'dark'
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Section({
  children,
  title,
  subtitle,
  actions,
  variant = 'default',
  containerSize = 'lg',
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        'py-12 md:py-16 lg:py-24',
        {
          'bg-white dark:bg-gray-900': variant === 'default',
          'bg-gray-50 dark:bg-gray-800': variant === 'muted',
          'bg-gray-900 dark:bg-gray-950 text-white': variant === 'dark',
        },
        className
      )}
      {...props}
    >
      <div
        className={cn('mx-auto px-4 sm:px-6 lg:px-8', {
          'max-w-3xl': containerSize === 'sm',
          'max-w-5xl': containerSize === 'md',
          'max-w-7xl': containerSize === 'lg',
          'max-w-[1400px]': containerSize === 'xl',
          'max-w-full': containerSize === 'full',
        })}
      >
        {(title || subtitle || actions) && (
          <div className="text-center mb-12 lg:mb-16">
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
            {actions && <div className="mt-6">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
