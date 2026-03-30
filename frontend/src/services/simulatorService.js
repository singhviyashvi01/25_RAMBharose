/**
 * SERVICE: simulatorService.js
 * Handles: POST /api/simulator — What-If risk intervention simulation
 */
import api from './api'

/**
 * Run a risk simulation with override parameters.
 * @param {string} patientId
 * @param {object} overrides - e.g., { bmi: 26, systolic_bp: 130, smoking_status: 0 }
 * @returns {{ original: RiskScores, simulated: RiskScores, delta: object }}
 */
export const simulateRisk = async (patientId, overrides) => {
  const { data } = await api.post('/simulator', {
    patient_id: patientId,
    overrides,
  })
  return data
}
