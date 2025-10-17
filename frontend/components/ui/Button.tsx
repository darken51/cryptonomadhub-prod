import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link' | 'outline' | 'default'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  fullWidth?: boolean
  isLoading?: boolean
  asChild?: boolean
  children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth,
      isLoading,
      disabled,
      asChild,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      {
        // Variants
        'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl hover:scale-105 focus-visible:outline-purple-600':
          variant === 'primary',
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:shadow-lg hover:border-purple-600 focus-visible:outline-gray-600':
          variant === 'secondary',
        'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300':
          variant === 'ghost',
        'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg focus-visible:outline-red-600':
          variant === 'danger',
        'text-purple-600 dark:text-purple-400 hover:underline underline-offset-4':
          variant === 'link',
        'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800':
          variant === 'outline',
        'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200':
          variant === 'default',
        // Sizes
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-base': size === 'md',
        'px-6 py-3 text-lg': size === 'lg',
        'h-10 w-10 p-0': size === 'icon',
        // Full width
        'w-full': fullWidth,
      },
      className
    )

    if (asChild) {
      // @ts-ignore - asChild pattern for composition
      return <>{children}</>
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={classes}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
