/**
 * UTILS: riskUtils.js
 * Purpose: Helper functions for risk tier colors, labels, and thresholds.
 */

/** Returns Tailwind color class for a risk tier */
export const getRiskColor = (tier) => {
  switch (tier) {
    case 'High':   return 'text-red-600'
    case 'Medium': return 'text-amber-500'
    case 'Low':    return 'text-green-600'
    default:       return 'text-gray-400'
  }
}

/** Returns Tailwind bg class for risk badge */
export const getRiskBgColor = (tier) => {
  switch (tier) {
    case 'High':   return 'bg-red-100 text-red-700 border-red-200'
    case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Low':    return 'bg-green-100 text-green-700 border-green-200'
    default:       return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

/** Converts a numeric score to a risk tier */
export const scoreToTier = (score) => {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

/** Returns emoji for risk tier */
export const getRiskEmoji = (tier) => {
  switch (tier) {
    case 'High':   return '🔴'
    case 'Medium': return '🟠'
    case 'Low':    return '🟢'
    default:       return '⚪'
  }
}

/** Format score for display */
export const formatScore = (score) => `${Math.round(score)}%`
