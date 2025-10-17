import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padded?: boolean
}

export function Container({
  children,
  size = 'lg',
  padded = true,
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto',
        {
          'max-w-3xl': size === 'sm',
          'max-w-5xl': size === 'md',
          'max-w-7xl': size === 'lg',
          'max-w-[1400px]': size === 'xl',
          'max-w-full': size === 'full',
          'px-4 sm:px-6 lg:px-8': padded,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
