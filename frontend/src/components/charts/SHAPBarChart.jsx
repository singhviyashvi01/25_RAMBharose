/**
 * COMPONENT: SHAPBarChart
 * Purpose: Horizontal bar chart showing SHAP feature importance for a patient.
 * Library: Chart.js via react-chartjs-2 (Bar, horizontal)
 * Props:
 *  - factors: Array<{ feature: string, display_label: string, impact: number }>
 *    - impact > 0: red bar (increases risk)
 *    - impact < 0: green bar (decreases risk)
 * Features:
 *  - Top 5-7 contributing factors
 *  - Positive bars in red, negative in green
 *  - Feature labels on Y axis ("BMI 31 (Obese)", "Current Smoker", etc.)
 *  - Title: "Why This Risk Score?"
 * Used on: PatientDetailPage
 */
const SHAPBarChart = ({ factors }) => {
  return <div>SHAPBarChart - TODO</div>
}
export default SHAPBarChart
