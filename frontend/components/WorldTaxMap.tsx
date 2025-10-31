'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps'
import { countryCodeMap } from '@/lib/countryCodeMap'

interface Country {
  country_code: string
  country_name: string
  flag_emoji?: string
  source_url?: string
  cgt_short_rate: number
  cgt_long_rate: number
  crypto_short_rate?: number
  crypto_long_rate?: number
  crypto_notes?: string
  crypto_legal_status?: 'legal' | 'banned' | 'restricted' | 'unclear'
  data_quality?: 'high' | 'medium' | 'low' | 'unknown'

  // Structured crypto tax metadata
  holding_period_months?: number
  is_flat_tax?: boolean
  is_progressive?: boolean
  is_territorial?: boolean
  crypto_specific?: boolean
  long_term_discount_pct?: number
  exemption_threshold?: number
  exemption_threshold_currency?: string

  // AI Analysis
  ai_analysis?: {
    crypto_score: number
    nomad_score: number
    overall_score: number
    crypto_score_breakdown?: any
    nomad_score_breakdown?: any
  }
}

interface WorldTaxMapProps {
  countries: Country[]
}

// GeoJSON topology URL (World map) - Using 50m resolution to include smaller countries
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"

export default function WorldTaxMap({ countries }: WorldTaxMapProps) {
  const router = useRouter()
  const [tooltipContent, setTooltipContent] = useState<string>('')
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Create a map of ISO codes to country data
  const countryDataMap = new Map<string, Country>()
  countries.forEach(country => {
    const isoCode = countryCodeMap[country.country_code]
    if (isoCode) {
      countryDataMap.set(isoCode, country)
    }
  })

  // Get color based on tax rate
  const getCountryColor = (country?: Country) => {
    if (!country) return '#E5E7EB' // Gray for no data

    // Banned countries in black
    if (country.crypto_legal_status === 'banned') return '#000000' // Black - Crypto banned

    const cryptoRate = country.crypto_long_rate ?? country.cgt_long_rate

    if (cryptoRate === 0) return '#10B981' // Green - 0% tax
    if (cryptoRate < 0.10) return '#3B82F6' // Blue - Low tax (<10%)
    if (cryptoRate < 0.20) return '#F59E0B' // Orange - Medium tax (10-20%)
    if (cryptoRate < 0.30) return '#EF4444' // Red - High tax (20-30%)
    return '#991B1B' // Dark Red - Very high tax (>30%)
  }

  const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
    const isoCode = geo.id
    const country = countryDataMap.get(isoCode)
    const countryName = geo.properties?.name || 'Unknown Country'

    if (country) {
      const cryptoRate = country.crypto_long_rate ?? country.cgt_long_rate
      const hasCryptoSpecific = country.crypto_long_rate !== undefined

      setTooltipContent(`
        <div class="text-left">
          <div class="font-bold text-lg mb-2 flex items-center gap-2">
            ${country.flag_emoji ? `<span class="text-2xl">${country.flag_emoji}</span>` : ''}
            <span>${country.country_name}</span>
          </div>
          <div class="space-y-1 text-sm">
            ${hasCryptoSpecific ? `
              <div class="flex justify-between gap-4">
                <span class="text-purple-300">Crypto Tax:</span>
                <span class="font-bold">${(cryptoRate * 100).toFixed(1)}%</span>
              </div>
            ` : `
              <div class="flex justify-between gap-4">
                <span class="text-gray-300">Long-term CGT:</span>
                <span class="font-bold">${(cryptoRate * 100).toFixed(1)}%</span>
              </div>
            `}
            <div class="flex justify-between gap-4">
              <span class="text-gray-300">Short-term:</span>
              <span class="font-bold">${((country.crypto_short_rate ?? country.cgt_short_rate) * 100).toFixed(1)}%</span>
            </div>
            ${country.holding_period_months ? `
              <div class="flex justify-between gap-4">
                <span class="text-gray-300">Holding period:</span>
                <span class="font-bold">${country.holding_period_months} months</span>
              </div>
            ` : ''}
            ${country.long_term_discount_pct ? `
              <div class="flex justify-between gap-4">
                <span class="text-gray-300">LT discount:</span>
                <span class="font-bold">${country.long_term_discount_pct}%</span>
              </div>
            ` : ''}
            ${country.exemption_threshold ? `
              <div class="flex justify-between gap-4">
                <span class="text-gray-300">Exemption:</span>
                <span class="font-bold">${country.exemption_threshold.toLocaleString()} ${country.exemption_threshold_currency || ''}</span>
              </div>
            ` : ''}
            ${country.is_flat_tax || country.is_progressive || country.is_territorial ? `
              <div class="mt-2 pt-2 border-t border-gray-600">
                <div class="flex flex-wrap gap-1">
                  ${country.is_flat_tax ? '<span class="text-xs bg-blue-600 px-1.5 py-0.5 rounded">Flat Tax</span>' : ''}
                  ${country.is_progressive ? '<span class="text-xs bg-purple-600 px-1.5 py-0.5 rounded">Progressive</span>' : ''}
                  ${country.is_territorial ? '<span class="text-xs bg-green-600 px-1.5 py-0.5 rounded">Territorial</span>' : ''}
                </div>
              </div>
            ` : ''}
            ${country.data_quality ? `
              <div class="mt-2 pt-2 border-t border-gray-600">
                <span class="text-xs text-gray-400">Quality: ${country.data_quality}</span>
              </div>
            ` : ''}
            ${country.source_url ? `
              <div class="mt-2 pt-2 border-t border-gray-600">
                <a href="${country.source_url}" target="_blank" class="text-xs text-blue-400 hover:underline">📎 Official Source</a>
              </div>
            ` : ''}
            ${country.ai_analysis ? `
              <div class="mt-3 pt-3 border-t border-gray-600">
                <div class="font-semibold mb-2 text-purple-300 text-sm">🤖 AI Analysis</div>
                <div class="space-y-1.5">
                  <div class="flex justify-between gap-4">
                    <span class="text-gray-300">🪙 Crypto Score:</span>
                    <span class="font-bold text-violet-400">${country.ai_analysis.crypto_score}/100</span>
                  </div>
                  <div class="flex justify-between gap-4">
                    <span class="text-gray-300">✈️ Nomad Score:</span>
                    <span class="font-bold text-fuchsia-400">${country.ai_analysis.nomad_score}/100</span>
                  </div>
                  <div class="flex justify-between gap-4">
                    <span class="text-gray-300">⭐ Overall:</span>
                    <span class="font-bold text-amber-400">${country.ai_analysis.overall_score}/100</span>
                  </div>
                </div>
                <div class="mt-2 text-xs text-gray-400 italic">Click to see full analysis</div>
              </div>
            ` : ''}
          </div>
        </div>
      `)
    } else {
      // Show country name even without tax data
      setTooltipContent(`
        <div class="text-left">
          <div class="font-bold text-lg mb-2">${countryName}</div>
          <div class="text-sm text-gray-400 mt-1">
            No tax data available
          </div>
        </div>
      `)
    }

    setTooltipPosition({ x: event.clientX, y: event.clientY })
    setShowTooltip(true)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
    setTooltipContent('')
  }

  return (
    <div className="relative">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Global Crypto Tax Map
        </h2>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
            <span className="text-gray-700 dark:text-gray-300">0% Tax</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
            <span className="text-gray-700 dark:text-gray-300">&lt;10%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
            <span className="text-gray-700 dark:text-gray-300">10-20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
            <span className="text-gray-700 dark:text-gray-300">20-30%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded" style={{ backgroundColor: '#991B1B' }}></div>
            <span className="text-gray-700 dark:text-gray-300">&gt;30%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded" style={{ backgroundColor: '#000000' }}></div>
            <span className="text-gray-700 dark:text-gray-300">Crypto Banned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-gray-700 dark:text-gray-300">No Data</span>
          </div>
        </div>

        {/* Map */}
        <div className="w-full" style={{ height: '500px' }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 147,
              center: [0, 20]
            }}
            className="w-full h-full"
          >
            <ZoomableGroup>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const country = countryDataMap.get(geo.id)
                    const fillColor = getCountryColor(country)

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillColor}
                        stroke="#FFF"
                        strokeWidth={0.5}
                        onMouseEnter={(event) => !isMobile && handleMouseEnter(geo, event)}
                        onMouseMove={(event) => !isMobile && handleMouseMove(event)}
                        onMouseLeave={() => !isMobile && handleMouseLeave()}
                        onClick={(event) => {
                          if (country) {
                            if (isMobile) {
                              // On mobile: show fixed popup instead of navigating
                              event.stopPropagation()
                              setSelectedCountryCode(country.country_code)
                              handleMouseEnter(geo, event as any)
                            } else {
                              // On desktop: navigate directly
                              router.push(`/countries/${country.country_code.toLowerCase()}`)
                            }
                          }
                        }}
                        style={{
                          default: {
                            outline: 'none',
                          },
                          hover: {
                            fill: country ? '#FBBF24' : fillColor,
                            outline: 'none',
                            cursor: country ? 'pointer' : 'default',
                            strokeWidth: 1
                          },
                          pressed: {
                            outline: 'none',
                          },
                        }}
                      />
                    )
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Custom Tooltip - Desktop: follows cursor, Mobile: fixed popup */}
        {showTooltip && tooltipContent && (
          <>
            {isMobile ? (
              /* Mobile: Fixed popup with close button and navigation */
              <>
                <div
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => {
                    setShowTooltip(false)
                    setSelectedCountryCode(null)
                  }}
                />
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm">
                  <div className="bg-gray-900 dark:bg-gray-800 text-white px-4 py-4 rounded-lg shadow-2xl border border-gray-700">
                    <div dangerouslySetInnerHTML={{ __html: tooltipContent }} />
                    {selectedCountryCode && (
                      <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
                        <button
                          onClick={() => router.push(`/countries/${selectedCountryCode.toLowerCase()}`)}
                          className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white py-2 px-4 rounded-lg font-semibold transition-all"
                        >
                          View details →
                        </button>
                        <button
                          onClick={() => {
                            setShowTooltip(false)
                            setSelectedCountryCode(null)
                          }}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Desktop: Tooltip follows cursor */
              <div
                className="fixed z-50 pointer-events-none"
                style={{
                  left: tooltipPosition.x + 15,
                  top: tooltipPosition.y + 15,
                }}
              >
                <div
                  className="bg-gray-900 dark:bg-gray-800 text-white px-4 py-3 rounded-lg shadow-xl border border-gray-700 max-w-xs"
                  dangerouslySetInnerHTML={{ __html: tooltipContent }}
                />
              </div>
            )}
          </>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          {isMobile ? 'Tap' : 'Hover over'} countries to see detailed tax rates • {countryDataMap.size} countries with data
        </p>
      </div>
    </div>
  )
}
