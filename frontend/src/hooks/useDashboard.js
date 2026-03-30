/**
 * HOOK: useDashboard
 * Purpose: Fetches and caches dashboard data.
 * Returns: { data, loading, error, refetch }
 */
import { useState, useEffect, useCallback } from 'react'
import { getDashboardData } from '../services/dashboardService'

export const useDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getDashboardData()
      setData(result)
      setError(null)
    } catch (e) {
      setError(e.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}
