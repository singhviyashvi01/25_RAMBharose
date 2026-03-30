/**
 * COMPONENT: PatientFilters
 * Purpose: Sidebar filter panel for the PatientsPage.
 * Props:
 *  - filters: { tier, condition, ward, hasAsha }
 *  - onChange: (filters) => void
 *  - wards: string[] — list of available wards from data
 * Controls:
 *  - Risk Tier: checkbox group (High, Medium, Low)
 *  - Condition: checkbox (Diabetes, Hypertension, CVD)
 *  - Ward: dropdown select
 *  - ASHA Assigned: toggle (Yes / No / All)
 *  - Reset Filters button
 */
const PatientFilters = ({ filters, onChange, wards }) => {
  return <div>PatientFilters - TODO</div>
}
export default PatientFilters
