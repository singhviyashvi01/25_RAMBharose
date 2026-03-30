/**
 * COMPONENT: ActionPlanCard
 * Purpose: Displays a single week's action plan step.
 * Props:
 *  - week: number (1–4)
 *  - title: string — e.g., "Week 1: Lifestyle Foundations"
 *  - actions: string[] — list of specific actions
 *  - type: "lifestyle" | "screening" | "medication" | "followup"
 * Feature: expand/collapse on click, icon per type
 * Used on: PatientDetailPage (30-day action plan section)
 */
const ActionPlanCard = ({ week, title, actions = [], type = 'lifestyle' }) => {
  const typeConfigs = {
    lifestyle: {
      icon: '🥗',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'text-emerald-700',
      label: 'Lifestyle Management'
    },
    screening: {
      icon: '🩺',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-700',
      label: 'Clinical Screening'
    },
    medication: {
      icon: '💊',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      text: 'text-rose-700',
      label: 'Medication Plan'
    },
    followup: {
      icon: '📅',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      text: 'text-purple-700',
      label: 'Follow-up'
    }
  }

  const config = typeConfigs[type] || typeConfigs.lifestyle

  return (
    <div className={`overflow-hidden rounded-2xl border ${config.border} ${config.bg} shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center gap-4 border-b border-white/50 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5">
          <span className="text-2xl">{config.icon}</span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Week {week}</p>
          <h4 className="font-bold text-slate-900">{title}</h4>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${config.bg} ${config.text} ring-1 ring-inset ${config.border}`}>
            {config.label}
          </span>
        </div>
        <ul className="space-y-3">
          {actions.map((action, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${config.text} bg-current`} />
              <p className="text-sm font-medium leading-relaxed text-slate-700">{action}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
export default ActionPlanCard
