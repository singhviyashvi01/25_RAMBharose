/**
 * SERVICE: ashaService.js
 * Handles: GET/POST /api/asha — task management and auto-assignment
 */
import api from './api'

/** Get all ASHA tasks with optional filters */
export const getAshaTasks = async ({ status, ward, workerId } = {}) => {
  const { data } = await api.get('/asha/tasks', {
    params: { status, ward, worker_id: workerId }
  })
  return data
}

/** Auto-assign ASHA workers to all high-risk unassigned patients */
export const autoAssignTasks = async () => {
  const { data } = await api.post('/asha/auto-assign')
  return data
}

/** Manually assign an ASHA to a task */
export const assignTask = async (taskId, ashaWorkerId) => {
  const { data } = await api.put(`/asha/tasks/${taskId}/assign`, {
    asha_worker_id: ashaWorkerId
  })
  return data
}

/** Update task status (Pending → InProgress → Done) */
export const updateTaskStatus = async (taskId, status) => {
  const { data } = await api.patch(`/asha/tasks/${taskId}/status`, { status })
  return data
}

/** Get all ASHA workers with capacity info */
export const getAshaWorkers = async () => {
  const { data } = await api.get('/asha/workers')
  return data
}
