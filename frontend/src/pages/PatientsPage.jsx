/**
 * PAGE: PatientsPage
 * Route: /patients
 * Purpose: Full patient list with search, filter, and sort.
 * Features:
 *  - Search bar (name, patient_id, ward)
 *  - Filter sidebar: Risk Tier (High/Med/Low), Condition, Ward, ASHA Assigned
 *  - Sort by: Risk Score (desc default), Name, Age, Last Visit
 *  - Patient table rows with color-coded risk badges
 *  - Click row → /patients/:id
 *  - Export filtered list to CSV
 *  - Pagination (50 per page)
 *  - Data from: GET /api/patients?tier=High&ward=A&page=1
 */
const PatientsPage = () => {
  return <div>PatientsPage - TODO</div>
}
export default PatientsPage
