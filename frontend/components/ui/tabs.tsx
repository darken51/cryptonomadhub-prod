"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: string; onValueChange?: (value: string) => void; defaultValue?: string }
>(({ className, value, onValueChange, defaultValue, children, ...props }, ref) => {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "")

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <div ref={ref} className={cn("", className)} data-value={selectedValue} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // Only pass props to Tabs components, not to regular divs
          const childType = (child.type as any)?.displayName || (child.type as any)?.name
          if (childType === 'TabsList' || childType === 'TabsContent' || childType === 'TabsTrigger') {
            return React.cloneElement(child as any, { selectedValue, onValueChange: handleValueChange })
          }
        }
        return child
      })}
    </div>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { selectedValue?: string; onValueChange?: (value: string) => void }
>(({ className, selectedValue, onValueChange, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400",
      className
    )}
    {...props}
  >
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        const childType = (child.type as any)?.displayName || (child.type as any)?.name
        if (childType === 'TabsTrigger') {
          return React.cloneElement(child as any, { selectedValue, onValueChange })
        }
      }
      return child
    })}
  </div>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; selectedValue?: string; onValueChange?: (value: string) => void }
>(({ className, value, selectedValue, onValueChange, ...props }, ref) => {
  const isActive = selectedValue === value
  return (
    <button
      ref={ref}
      type="button"
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50 shadow-sm"
          : "hover:bg-gray-200 dark:hover:bg-gray-700",
        className
      )}
      onClick={() => onValueChange?.(value)}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; selectedValue?: string; onValueChange?: (value: string) => void }
>(({ className, value, selectedValue, onValueChange, ...props }, ref) => {
  if (selectedValue !== value) return null

  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
