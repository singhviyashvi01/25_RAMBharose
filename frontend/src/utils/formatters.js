/**
 * UTILS: formatters.js
 * Purpose: Date, number, and string formatting helpers.
 */

/** Format date to "15 Mar 2025" */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

/** Format a number with commas (Indian number system) */
export const formatNumber = (n) => {
  if (n == null) return '—'
  return n.toLocaleString('en-IN')
}

/** Format age + gender: "52M", "45F" */
export const formatAgeGender = (age, gender) => `${age}${gender?.toUpperCase() || ''}`

/** Capitalize first letter */
export const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

/** Truncate long text with ellipsis */
export const truncate = (str, maxLen = 40) =>
  str && str.length > maxLen ? `${str.slice(0, maxLen)}...` : str || ''

/** Format file size */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
