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
  return <span>RiskBadge - TODO</span>
}
export default RiskBadge
