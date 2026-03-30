/**
 * HOOK: usePatients
 * Purpose: Fetches paginated, filtered patient list.
 * Returns: { patients, total, page, loading, error, setFilters, setPage, refetch }
 */
import { useState, useEffect, useCallback } from 'react'
import { getPatients } from '../services/patientService'

export const usePatients = (initialFilters = {}) => {
  const [patients, setPatients] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(initialFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getPatients({ ...filters, page })
      setPatients(result.patients)
      setTotal(result.total)
      setError(null)
    } catch (e) {
      setError(e.message || 'Failed to load patients')
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => { fetch() }, [fetch])

  return { patients, total, page, setPage, loading, error, filters, setFilters, refetch: fetch }
}
