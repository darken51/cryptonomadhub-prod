/**
 * Custom hook for fetching all dashboard data in parallel
 * Reduces multiple sequential fetches to a single batch
 */

import { useEffect, useState, useCallback } from 'react'

export interface DashboardData {
  overview: any
  walletPortfolio: any
  simulations: any[]
  stats: {
    count: number
    totalSavings: number
    countriesCompared: number
  }
}

export function useDashboardData(token: string | null) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL
      const headers = { Authorization: `Bearer ${token}` }

      // ✅ OPTIMIZATION: Fetch all data in PARALLEL (not sequential)
      const [overviewRes, portfolioRes, simulationsRes] = await Promise.all([
        fetch(`${baseUrl}/dashboard/overview`, {
          headers,
          cache: 'no-store' // Disable cache to avoid stale data on dashboard
        }),
        fetch(`${baseUrl}/wallet-portfolio/overview`, {
          headers,
          cache: 'no-store'
        }),
        fetch(`${baseUrl}/simulations/history`, {
          headers,
          cache: 'no-store'
        }),
      ])

      // Parse responses in parallel
      const [overview, portfolio, simData] = await Promise.all([
        overviewRes.ok ? overviewRes.json() : null,
        portfolioRes.ok ? portfolioRes.json() : null,
        simulationsRes.ok ? simulationsRes.json() : { simulations: [] },
      ])

      // Calculate stats
      const simulations = simData.simulations || []
      const uniqueCountries = new Set()
      let totalSavings = 0

      simulations.forEach((sim: any) => {
        uniqueCountries.add(sim.current_country)
        uniqueCountries.add(sim.target_country)
        totalSavings += sim.savings || 0
      })

      setData({
        overview,
        walletPortfolio: portfolio,
        simulations: simulations.slice(0, 3),
        stats: {
          count: simulations.length,
          totalSavings,
          countriesCompared: uniqueCountries.size,
        },
      })
    } catch (err) {
      setError(err as Error)
      console.error('[Dashboard] Failed to fetch data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  // Fetch on mount and when token changes
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
