/**
 * SERVICE: appointmentService.js
 * Handles: GET /api/appointments, POST /api/appointments, PATCH /api/appointments/:id
 */
import api from './api'

/** Get appointments for a specific doctor */
export const getAppointments = async (doctor_id) => {
  const { data } = await api.get('/appointments', {
    params: { doctor_id }
  })
  return data
}

/** Create a new appointment */
export const createAppointment = async (appointmentData, doctor_id) => {
  const { data } = await api.post('/appointments', appointmentData, {
    params: { doctor_id }
  })
  return data
}

/** Update appointment status */
export const updateAppointmentStatus = async (appointmentId, status) => {
  const { data } = await api.patch(`/appointments/${appointmentId}`, null, {
    params: { status }
  })
  return data
}

/** Delete an appointment */
export const deleteAppointment = async (appointmentId) => {
  const { data } = await api.delete(`/appointments/${appointmentId}`)
  return data
}
