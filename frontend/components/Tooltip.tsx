'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'

interface TooltipProps {
  content: string
  children?: React.ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors"
      >
        {children || <Info className="w-4 h-4" />}
      </button>

      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-slate-900 dark:bg-slate-700 rounded-lg shadow-lg whitespace-nowrap max-w-xs">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45"></div>
        </div>
      )}
    </div>
  )
}
