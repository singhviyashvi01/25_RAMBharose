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
import RiskBadge from '../common/RiskBadge'

const PatientTable = ({ patients = [], loading, onRowClick, compact = false }) => {
  if (loading) {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Patient Name</th>
              {!compact && <th className="px-6 py-4 text-center">Age / Sex</th>}
              <th className="px-6 py-4 text-center">Overall Risk</th>
              <th className="px-6 py-4">Primary Condition</th>
              {!compact && <th className="px-6 py-4">Last Visit</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...Array(compact ? 3 : 6)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="h-4 w-32 rounded bg-slate-100" />
                </td>
                {!compact && (
                  <td className="px-6 py-4">
                    <div className="mx-auto h-4 w-12 rounded bg-slate-100" />
                  </td>
                )}
                <td className="px-6 py-4 text-center">
                  <div className="mx-auto h-6 w-16 rounded-full bg-slate-100" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 rounded bg-slate-100" />
                </td>
                {!compact && (
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 rounded bg-slate-100" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!patients.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <div className="mb-4 text-4xl">📁</div>
        <h3 className="text-lg font-semibold text-slate-900">No Patients Found</h3>
        <p className="text-sm text-slate-500">Please upload a dataset or adjust filters.</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-6 py-4">Patient Name</th>
            {!compact && <th className="px-6 py-4 text-center text-slate-400">Info</th>}
            <th className="px-6 py-4 text-center">Overall Risk</th>
            <th className="px-6 py-4">Primary Condition</th>
            {!compact && <th className="px-6 py-4">Top Factor</th>}
            {!compact && <th className="px-6 py-4">Last Visit</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {patients.map((p) => (
            <tr 
              key={p.patient_id} 
              onClick={() => onRowClick?.(p.patient_id)}
              className="group cursor-pointer transition-colors hover:bg-slate-50/80"
            >
              <td className="px-6 py-4">
                <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors uppercase">{p.name || 'Unknown'}</p>
                <p className="text-[10px] tabular-nums text-slate-400">{p.patient_id}</p>
              </td>
              {!compact && (
                <td className="px-6 py-4 text-center text-slate-600">
                  <span className="font-medium">{p.age || '—'}</span>
                  <span className="mx-1 opacity-20">|</span>
                  <span>{p.gender || '—'}</span>
                </td>
              )}
              <td className="px-6 py-4 text-center">
                <RiskBadge score={p.overall_risk} tier={p.risk_tier} size="sm" />
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {p.primary_condition || 'Healthy'}
                </span>
              </td>
              {!compact && (
                <td className="max-w-[200px] truncate px-6 py-4 text-slate-500">
                  {p.top_factor_label || '—'}
                </td>
              )}
              {!compact && (
                <td className="px-6 py-4 text-slate-500 tabular-nums">
                  {p.last_visit_date || 'New Patient'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default PatientTable
