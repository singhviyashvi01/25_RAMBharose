/**
 * COMPONENT: PatientTable
 * Purpose: Reusable data table for displaying patients with risk scores.
 * Props:
 *  - patients: PatientListItem[]
 *  - loading: boolean
 *  - onRowClick: (patientId: string) => void
 *  - compact: boolean — compact mode for dashboard preview (5 rows)
 * Columns: Name, Age/Gender, Risk Score (RiskBadge), Primary Condition,
 *          Top Risk Factor, Last Visit, Action (View Plan button)
 * Features:
 *  - Alternating row colors
 *  - Skeleton loading rows
 *  - Empty state message
 *  - Row click navigates to /patients/:id
 * Used on: DashboardPage (compact), PatientsPage (full)
 */
const PatientTable = ({ patients, loading, onRowClick, compact = false }) => {
  return <table>PatientTable - TODO</table>
}
export default PatientTable
