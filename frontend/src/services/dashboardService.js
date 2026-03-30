/**
 * SERVICE: dashboardService.js
 * Handles: GET /api/dashboard — KPIs, charts, distributions
 */
import api from './api'

/** Fetch all dashboard data (KPIs, risk distribution, trend, ward summary) */
export const getDashboardData = async () => {
  const { data } = await api.get('/dashboard')
  return data
}
