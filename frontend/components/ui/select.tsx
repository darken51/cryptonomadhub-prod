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

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div data-value={selectedValue} className="relative">
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
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { selectedValue?: string; onValueChange?: (value: string) => void }>(
  ({ className, children, selectedValue, onValueChange, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, selectedValue }: { placeholder?: string; selectedValue?: string }) => {
  return <span>{selectedValue || placeholder || "Select..."}</span>
}

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { selectedValue?: string; onValueChange?: (value: string) => void }>(
  ({ className, children, selectedValue, onValueChange, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute top-full left-0 right-0 mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-950 dark:text-gray-50 shadow-md",
        className
      )}
      {...props}
    >
      <div className="p-1">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as any, { selectedValue, onValueChange })
          }
          return child
        })}
      </div>
    </div>
  )
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string; selectedValue?: string; onValueChange?: (value: string) => void }>(
  ({ className, children, value, selectedValue, onValueChange, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700",
        selectedValue === value && "bg-gray-100 dark:bg-gray-700",
        className
      )}
      onClick={() => onValueChange?.(value)}
      {...props}
    >
      {children}
    </div>
  )
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
