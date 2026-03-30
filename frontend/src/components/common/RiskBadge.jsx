/**
 * COMPONENT: RiskBadge
 * Purpose: Color-coded pill badge showing risk score and tier.
 * Props:
 *  - score: number (0-100)
 *  - tier: "High" | "Medium" | "Low"
 *  - size: "sm" | "md" | "lg"
 * Colors:
 *  - High (≥70): Red background
 *  - Medium (40-69): Amber background
 *  - Low (<40): Green background
 * Example: <RiskBadge score={87} tier="High" size="md" />
 * Renders: "87% 🔴 High" pill
 */
const RiskBadge = ({ score, tier, size = 'md' }) => {
  const settings = {
    High: {
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
      label: "High"
    },
    Medium: {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
      label: "Medium"
    },
    Low: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
      label: "Low"
    }
  }

  const current = settings[tier] || settings.Low
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2 font-semibold"
  }

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${current.bg} ${sizeClasses[size]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot} animate-pulse`} />
      {score !== undefined && <span>{Math.round(score)}%</span>}
      <span className="opacity-80">{current.label}</span>
    </span>
  )
}
export default RiskBadge
