'use client'

/**
 * ✅ PHASE 3.2: Breadcrumbs navigation component
 * Améliore la navigation et l'orientation de l'utilisateur
 */

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
        {/* Home link */}
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>

        {/* Breadcrumb items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center space-x-2">
              <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? 'text-slate-900 dark:text-white font-medium'
                      : 'text-slate-600 dark:text-slate-400'
                  }
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
