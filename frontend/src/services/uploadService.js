/**
 * SERVICE: uploadService.js
 * Handles: POST /api/upload — send CSV/XLSX file for ML processing
 */
import api from './api'

/**
 * Upload a hospital dataset file.
 * @param {File} file - CSV or XLSX file
 * @param {Function} onProgress - progress callback (0-100)
 * @returns {Promise<UploadResponse>}
 */
export const uploadDataset = async (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
    },
  })
  return data
}

/**
 * Get all past upload batches for this hospital.
 * @returns {Promise<Array>}
 */
export const getUploadHistory = async () => {
  const { data } = await api.get('/upload/history')
  return data
}
