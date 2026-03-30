/**
 * SERVICE: campsService.js
 * Handles: GET /api/camps — screening camp planner
 */
import api from './api'

/** Get ward-level risk summary and camp recommendations */
export const getCampPlan = async ({ month, ward } = {}) => {
  const { data } = await api.get('/camps/plan', { params: { month, ward } })
  return data
}

/** Get upcoming and past screening camps */
export const getCamps = async () => {
  const { data } = await api.get('/camps')
  return data
}

/** Create/schedule a new camp */
export const createCamp = async (campData) => {
  const { data } = await api.post('/camps', campData)
  return data
}
