"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Select = ({ children, value, onValueChange, defaultValue }: {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}) => {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "")
  const [isOpen, setIsOpen] = React.useState(false)
  const selectRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  // Close dropdown on Escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Backdrop overlay when open - closes on click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/5"
          onMouseDown={(e) => {
            e.preventDefault()
            setIsOpen(false)
          }}
          aria-hidden="true"
        />
      )}

      <div ref={selectRef} data-value={selectedValue} className="relative">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            // Only pass props to Select components, not to regular elements
            const childType = (child.type as any)?.displayName || (child.type as any)?.name
            if (childType === 'SelectTrigger') {
              return React.cloneElement(child as any, { selectedValue, onValueChange: handleValueChange, onClick: toggleOpen })
            }
            if (childType === 'SelectContent') {
              return isOpen ? React.cloneElement(child as any, { selectedValue, onValueChange: handleValueChange }) : null
            }
            if (childType === 'SelectValue') {
              return React.cloneElement(child as any, { selectedValue, onValueChange: handleValueChange })
            }
          }
          return child
        })}
      </div>
    </>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { selectedValue?: string; onValueChange?: (value: string) => void }>(
  ({ className, children, selectedValue, onValueChange, onClick, ...props }, ref) => {
    // Extract placeholder from children if SelectValue exists
    let displayText = selectedValue || "Select..."
    let placeholder = "Select..."

    React.Children.forEach(children, child => {
      if (React.isValidElement(child)) {
        const childType = (child.type as any)?.displayName || (child.type as any)?.name
        if (childType === 'SelectValue' && (child.props as any).placeholder) {
          placeholder = (child.props as any).placeholder
        }
      }
    })

    if (!selectedValue) {
      displayText = placeholder
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 px-4 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-violet-400 transition-colors cursor-pointer",
          className
        )}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(e as any)
        }}
        {...props}
      >
        <span className="flex-1 text-left truncate text-slate-900 dark:text-slate-100">{displayText}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0 text-violet-600 dark:text-violet-400"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, selectedValue }: { placeholder?: string; selectedValue?: string }) => {
  // This component is now handled by SelectTrigger for better rendering
  return null
}

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { selectedValue?: string; onValueChange?: (value: string) => void }>(
  ({ className, children, selectedValue, onValueChange, ...props }, ref) => {
    const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 })
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useLayoutEffect(() => {
      // Get trigger button position to position dropdown correctly
      const updatePosition = () => {
        const triggerElement = contentRef.current?.parentElement?.querySelector('button')
        if (triggerElement) {
          const rect = triggerElement.getBoundingClientRect()
          setPosition({
            top: rect.bottom + 8, // 8px gap (mt-2)
            left: rect.left,
            width: rect.width
          })
        }
      }

      updatePosition()

      // Update position on scroll or resize
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)

      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }, [])

    return (
      <div
        ref={(node) => {
          if (contentRef) {
            (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          }
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }}
        className={cn(
          "fixed z-[60] min-w-[8rem] max-h-[500px] overflow-y-auto rounded-lg border-2 border-violet-200 dark:border-violet-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-2xl animate-in fade-in-0 zoom-in-95",
          className
        )}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${position.width}px`
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
      <div className="p-2">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            // Only pass props to SelectItem components, not to regular DOM elements
            const childType = (child.type as any)?.displayName || (child.type as any)?.name
            if (childType === 'SelectItem') {
              return React.cloneElement(child as any, { selectedValue, onValueChange })
            }
          }
          return child
        })}
      </div>
    </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string; selectedValue?: string; onValueChange?: (value: string) => void; disabled?: boolean }>(
  ({ className, children, value, selectedValue, onValueChange, disabled, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-3 px-3 text-sm outline-none transition-colors",
        !disabled && "hover:bg-violet-100 dark:hover:bg-violet-900/30 active:bg-violet-200 dark:active:bg-violet-900/50",
        selectedValue === value && "bg-violet-50 dark:bg-violet-900/20 font-semibold",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={() => !disabled && onValueChange?.(value)}
      {...props}
    >
      {children}
    </div>
  )
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
