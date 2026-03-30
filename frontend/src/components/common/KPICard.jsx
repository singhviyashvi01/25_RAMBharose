/**
 * COMPONENT: KPICard
 * Purpose: Metric summary card used in Dashboard and other pages.
 * Props:
 *  - title: string           — e.g., "Total Patients"
 *  - value: string | number  — e.g., 1247
 *  - subtitle: string        — e.g., "+32 new this week"
 *  - icon: ReactNode         — icon element
 *  - color: "blue"|"red"|"amber"|"green"
 *  - trend: "up"|"down"|null
 * Example: <KPICard title="High Risk" value={312} subtitle="25% of total" color="red" trend="up" />
 */
const KPICard = ({ title, value, subtitle, icon, color, trend }) => {
  return <div>KPICard - TODO</div>
}
export default KPICard
