'use client'

import { useState, useEffect } from 'react'
import { Globe, AlertTriangle, Info, Check, Search } from 'lucide-react'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { useAuth } from './providers/AuthProvider'

interface Country {
  country_code: string
  country_name: string
  flag_emoji: string
  crypto_short_rate: number | null
  crypto_long_rate: number | null
  crypto_notes?: string
}

interface JurisdictionSelectorProps {
  currentJurisdiction?: string | null
  onJurisdictionChange?: (jurisdiction: string) => void
  showBadgeOnly?: boolean
  className?: string
}

export function JurisdictionSelector({
  currentJurisdiction,
  onJurisdictionChange,
  showBadgeOnly = false,
  className = ''
}: JurisdictionSelectorProps) {
  const { token } = useAuth()
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string | null>(currentJurisdiction || null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSelector, setShowSelector] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)  // Control list visibility

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${API_URL}/regulations/`)
        if (!response.ok) throw new Error('Failed to fetch countries')

        const data = await response.json()
        console.log(`[JurisdictionSelector] Loaded ${data.length} countries`)
        setCountries(data)
        setLoading(false)
      } catch (err) {
        console.error('[JurisdictionSelector] Error fetching countries:', err)
        setError('Failed to load countries')
        setLoading(false)
      }
    }

    fetchCountries()
  }, [API_URL])

  // Update local state when prop changes
  useEffect(() => {
    if (currentJurisdiction !== undefined) {
      setSelectedCountry(currentJurisdiction)
    }
  }, [currentJurisdiction])

  const handleSave = async () => {
    if (!selectedCountry) {
      console.warn('[JurisdictionSelector] No country selected')
      return
    }

    console.log('[JurisdictionSelector] Saving jurisdiction:', selectedCountry)
    setSaving(true)
    setError(null)

    try {
      if (!token) {
        throw new Error('Not authenticated - please log in again')
      }

      console.log('[JurisdictionSelector] Updating cost-basis settings...')
      // Update cost basis settings
      const response = await fetch(`${API_URL}/cost-basis/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tax_jurisdiction: selectedCountry
        })
      })

      console.log('[JurisdictionSelector] Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[JurisdictionSelector] Error response:', errorData)
        throw new Error(errorData.detail || 'Failed to update jurisdiction')
      }

      const result = await response.json()
      console.log('[JurisdictionSelector] Cost basis settings updated:', result)

      // Also update tax optimizer settings
      console.log('[JurisdictionSelector] Updating tax-optimizer settings...')
      const taxOptResponse = await fetch(`${API_URL}/tax-optimizer/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tax_jurisdiction: selectedCountry
        })
      })

      console.log('[JurisdictionSelector] Tax optimizer response status:', taxOptResponse.status)

      if (onJurisdictionChange) {
        onJurisdictionChange(selectedCountry)
      }

      console.log('[JurisdictionSelector] ✅ Jurisdiction saved successfully!')
      setShowSelector(false)
      setIsExpanded(false)  // Collapse the list after saving

      // Show success message
      alert(`✅ Tax jurisdiction set to ${selectedCountry}`)
    } catch (err: any) {
      console.error('[JurisdictionSelector] ❌ Error updating jurisdiction:', err)
      setError(err.message || 'Failed to update jurisdiction')
    } finally {
      setSaving(false)
    }
  }

  const currentCountryData = countries.find(c => c.country_code === selectedCountry)

  // Filter countries based on search query and sort alphabetically
  const filteredCountries = countries
    .filter(country =>
      country.country_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.country_code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.country_name.localeCompare(b.country_name))

  // Badge-only mode
  if (showBadgeOnly && !showSelector) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge
          variant={selectedCountry ? "success" : "danger"}
          className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setShowSelector(true)}
        >
          <Globe className="w-3.5 h-3.5" />
          {selectedCountry && currentCountryData ? (
            <>
              <span>{currentCountryData.flag_emoji}</span>
              <span className="font-medium">{currentCountryData.country_name}</span>
            </>
          ) : (
            <span className="font-medium">Tax Jurisdiction Not Set</span>
          )}
        </Badge>
        {!selectedCountry && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSelector(true)}
            className="text-xs"
          >
            Set Now
          </Button>
        )}
      </div>
    )
  }

  // Full selector mode
  return (
    <div className={`space-y-4 ${className}`}>
      {!selectedCountry && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Tax Jurisdiction Required</AlertTitle>
          <AlertDescription>
            Please select your tax jurisdiction to get accurate tax calculations and recommendations.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Select Your Tax Jurisdiction
          </label>
          {selectedCountry && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Change
            </button>
          )}
        </div>

        {/* Show current selection when collapsed */}
        {selectedCountry && !isExpanded && currentCountryData && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="w-full p-4 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 rounded-xl flex items-center justify-between hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentCountryData.flag_emoji}</span>
              <div className="text-left">
                <div className="font-semibold text-emerald-900 dark:text-emerald-100">{currentCountryData.country_name}</div>
                <div className="text-sm text-emerald-700 dark:text-emerald-300">Tax Jurisdiction - Click to change</div>
              </div>
            </div>
            <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </button>
        )}

        {/* Search and Select Combined - only show when expanded or no selection */}
        {(!selectedCountry || isExpanded) && (
          <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="🔍 Type to search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Country list */}
          <div className="max-h-64 overflow-y-auto border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">Loading countries...</div>
            ) : filteredCountries.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No countries found matching "{searchQuery}"
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredCountries.map((country) => (
                  <button
                    key={country.country_code}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(country.country_code)
                      setIsExpanded(false)  // Close the list after selection
                      setSearchQuery('')     // Clear search
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-between ${
                      selectedCountry === country.country_code ? 'bg-emerald-100 dark:bg-emerald-900/40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{country.flag_emoji}</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{country.country_name}</span>
                      {country.crypto_long_rate === 0 && (
                        <Badge variant="success" className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                          0% Tax
                        </Badge>
                      )}
                    </div>
                    {selectedCountry === country.country_code && (
                      <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
        )}

        {selectedCountry && currentCountryData && isExpanded && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Tax Rates for {currentCountryData.country_name}</AlertTitle>
            <AlertDescription className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Short-term rate:</span>
                <span className="font-semibold">
                  {currentCountryData.crypto_short_rate !== null
                    ? `${(currentCountryData.crypto_short_rate * 100).toFixed(1)}%`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Long-term rate:</span>
                <span className="font-semibold">
                  {currentCountryData.crypto_long_rate !== null
                    ? `${(currentCountryData.crypto_long_rate * 100).toFixed(1)}%`
                    : 'N/A'}
                </span>
              </div>
              {currentCountryData.crypto_notes && (
                <p className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  {currentCountryData.crypto_notes}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Always show Save button when a country is selected */}
        {selectedCountry && (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Jurisdiction
                </>
              )}
            </Button>
            {showBadgeOnly && (
              <Button
                variant="outline"
                onClick={() => {
                  setShowSelector(false)
                  setIsExpanded(false)
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
