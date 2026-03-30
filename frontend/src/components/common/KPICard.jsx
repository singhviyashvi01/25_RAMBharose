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
const KPICard = ({ title, value, subtitle, icon, color = "blue", trend }) => {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/5 text-blue-600 border-blue-200/50",
    red: "from-red-500/20 to-red-600/5 text-red-600 border-red-200/50",
    amber: "from-amber-500/20 to-amber-600/5 text-amber-600 border-amber-200/50",
    green: "from-green-500/20 to-green-600/5 text-green-600 border-green-200/50",
    purple: "from-purple-500/20 to-purple-600/5 text-purple-600 border-purple-200/50",
  }

  const trendIcon = trend === "up" ? "↗" : trend === "down" ? "↘" : ""
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-slate-400"

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-sm transition-all hover:shadow-md ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <h3 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
          
          {subtitle && (
            <div className="mt-2 flex items-center gap-1">
              {trend && (
                <span className={`text-xs font-bold ${trendColor}`}>
                  {trendIcon}
                </span>
              )}
              <span className="text-xs font-medium text-slate-500">{subtitle}</span>
            </div>
          )}
        </div>
        
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/60 shadow-sm backdrop-blur-md">
          {icon || <span className="text-xl">📊</span>}
        </div>
      </div>
      
      {/* Subtle background decoration */}
      <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-current opacity-[0.03]" />
    </div>
  )
}
export default KPICard
