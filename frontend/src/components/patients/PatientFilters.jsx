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
const PatientFilters = ({ filters = {}, onChange, wards = [] }) => {
  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onChange({
      tier: 'All',
      condition: 'All',
      ward: 'All',
      hasAsha: 'All'
    })
  }

  const selectClass = "w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
  const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"

  return (
    <div className="flex flex-col gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="font-bold text-slate-900">Filters</h3>
        <button 
          onClick={resetFilters}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          Reset All
        </button>
      </div>

      <div>
        <label className={labelClass}>Risk Tier</label>
        <select 
          value={filters.tier || 'All'} 
          onChange={(e) => updateFilter('tier', e.target.value)}
          className={selectClass}
        >
          <option value="All">All Tiers</option>
          <option value="High">🔴 High Risk</option>
          <option value="Medium">🟠 Medium Risk</option>
          <option value="Low">🟢 Low Risk</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Condition</label>
        <select 
          value={filters.condition || 'All'} 
          onChange={(e) => updateFilter('condition', e.target.value)}
          className={selectClass}
        >
          <option value="All">All Conditions</option>
          <option value="Diabetes">Diabetes</option>
          <option value="Hypertension">Hypertension</option>
          <option value="CVD">CVD</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Ward</label>
        <select 
          value={filters.ward || 'All'} 
          onChange={(e) => updateFilter('ward', e.target.value)}
          className={selectClass}
        >
          <option value="All">All Wards</option>
          {wards.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>ASHA Status</label>
        <div className="grid grid-cols-2 gap-2">
          {['All', 'Yes', 'No'].map(opt => (
            <button
              key={opt}
              onClick={() => updateFilter('hasAsha', opt)}
              className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                (filters.hasAsha || 'All') === opt 
                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" 
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {opt === 'All' ? 'Everyone' : opt === 'Yes' ? 'Assigned' : 'Unassigned'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="rounded-xl bg-blue-600/5 p-4 border border-blue-600/10">
        <p className="text-[10px] font-bold uppercase text-blue-600">Pro Tip</p>
        <p className="mt-1 text-xs leading-relaxed text-blue-700/80">
          Filter by "High Risk" + "No ASHA" to identify patients needing immediate attention.
        </p>
      </div>
    </div>
  )
}
export default PatientFilters
