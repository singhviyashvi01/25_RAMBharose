/**
 * PAGE: PatientDetailPage
 * Route: /patients/:id
 * Purpose: Full individual patient risk profile.
 * Features:
 *  - Patient header: Name, Age, Gender, Ward, ASHA Worker
 *  - Tri-condition Risk Score Cards: Diabetes / Hypertension / CVD (each 0-100%)
 *  - Overall Risk Score large badge (High / Medium / Low)
 *  - Risk Trajectory indicator: "Rapidly Worsening" / "Stable" / "Improving"
 *  - SHAP Explainability Section:
 *      - Horizontal bar chart: top contributing features (red=increases, green=decreases risk)
 *      - XAI summary text: "High risk due to BMI 31 + Current Smoker + Sedentary Lifestyle"
 *  - 30-Day Action Plan Section (LangChain generated):
 *      - Timeline / step-by-step cards (Week 1, Week 2, ...)
 *      - Specific: diet advice, medications, screenings, follow-up dates
 *      - "Regenerate Plan" button
 *  - Clinical History: last lab values, visit dates
 *  - SDOH Panel: Income, Food Security, Housing (social determinants)
 *  - Assign ASHA Worker button
 *  - Data from: GET /api/patients/:id, GET /api/action-plans/:id
 */
const PatientDetailPage = () => {
  return <div>PatientDetailPage - TODO</div>
}
export default PatientDetailPage
