'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Country {
  country_code: string
  country_name: string
  flag_emoji?: string
  cgt_short_rate: number
  cgt_long_rate: number
  crypto_short_rate?: number
  crypto_long_rate?: number
}

interface CountryAutocompleteProps {
  countries: Country[]
}

export default function CountryAutocomplete({ countries }: CountryAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Filter countries based on search query
  const filteredCountries = query.trim()
    ? countries
        .filter(c =>
          c.country_name.toLowerCase().includes(query.toLowerCase()) ||
          c.country_code.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8) // Limit to 8 results
    : []

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredCountries.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < filteredCountries.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCountries[selectedIndex]) {
          navigateToCountry(filteredCountries[selectedIndex].country_code)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const navigateToCountry = (code: string) => {
    router.push(`/countries/${code.toLowerCase()}`)
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const getTaxRate = (country: Country) => {
    const rate = country.crypto_long_rate ?? country.cgt_long_rate
    return (rate * 100).toFixed(0)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search 167 countries by name or code..."
          className="w-full pl-12 pr-12 py-4 text-base border-2 border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:focus:ring-fuchsia-500 dark:focus:border-fuchsia-500 bg-white text-slate-900 dark:bg-slate-800 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-lg"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && filteredCountries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto">
              {filteredCountries.map((country, index) => (
                <motion.button
                  key={country.country_code}
                  onClick={() => navigateToCountry(country.country_code)}
                  className={`w-full px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                    index === selectedIndex
                      ? 'bg-violet-50 dark:bg-violet-900/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {country.flag_emoji && (
                      <span className="text-2xl flex-shrink-0">{country.flag_emoji}</span>
                    )}
                    <div className="text-left min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {country.country_name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {country.country_code}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-sm font-bold ${
                      getTaxRate(country) === '0'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {getTaxRate(country)}% tax
                    </div>
                    {getTaxRate(country) === '0' && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        ⭐ Tax haven
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {filteredCountries.length === 8 && (
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 text-center">
                Showing top 8 results. Keep typing to narrow down...
              </div>
            )}
          </motion.div>
        )}

        {isOpen && query.trim() && filteredCountries.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-6 text-center"
          >
            <p className="text-slate-600 dark:text-slate-400">
              No countries found matching "{query}"
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              Try searching by country name or code
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
