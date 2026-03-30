/**
 * COMPONENT: SimulatorSlider
 * Purpose: Individual intervention slider for the Risk Simulator page.
 * Props:
 *  - label: string — e.g., "Systolic BP"
 *  - unit: string — e.g., "mmHg"
 *  - min: number
 *  - max: number
 *  - step: number
 *  - value: number
 *  - originalValue: number — patient's actual value (shown as marker)
 *  - onChange: (value: number) => void
 *  - clinicalThresholds: { warning: number, danger: number }
 * Features:
 *  - Color changes as value crosses clinical thresholds (green → amber → red)
 *  - "Reset to original" button
 *  - Shows current value prominently
 * Used on: RiskSimulatorPage
 */
const SimulatorSlider = ({ 
  label, 
  unit, 
  min, 
  max, 
  step = 1, 
  value, 
  originalValue, 
  onChange, 
  clinicalThresholds = { warning: 130, danger: 140 } 
}) => {
  const isChanged = value !== originalValue

  // Determine current "health" color for the value
  const getColorClass = () => {
    if (value >= clinicalThresholds.danger) return 'text-rose-600 bg-rose-50'
    if (value >= clinicalThresholds.warning) return 'text-amber-600 bg-amber-50'
    return 'text-emerald-600 bg-emerald-50'
  }

  const getSliderColor = () => {
    if (value >= clinicalThresholds.danger) return 'accent-rose-500'
    if (value >= clinicalThresholds.warning) return 'accent-amber-500'
    return 'accent-emerald-500'
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{label}</h4>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Range: {min}-{max} {unit}</p>
        </div>
        <div className={`rounded-lg px-3 py-1.5 text-lg font-black tabular-nums transition-colors ${getColorClass()}`}>
          {value} <span className="text-[10px] font-bold uppercase opacity-60 ml-0.5">{unit}</span>
        </div>
      </div>

      <div className="relative mt-2 flex flex-col gap-2">
        <input 
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 transition-all ${getSliderColor()}`}
        />
        
        <div className="flex justify-between text-[10px] font-bold text-slate-400">
          <span>{min}</span>
          {isChanged && (
            <button 
              onClick={() => onChange(originalValue)}
              className="text-blue-600 hover:underline"
            >
              Reset to {originalValue}
            </button>
          )}
          <span>{max}</span>
        </div>

        {/* Marker for original value */}
        <div 
          className="absolute -top-1 h-4 w-0.5 bg-slate-300"
          style={{ 
            left: `${((originalValue - min) / (max - min)) * 100}%`,
            opacity: value === originalValue ? 0 : 1 
          }}
          title={`Original: ${originalValue}`}
        />
      </div>
    </div>
  )
}
export default SimulatorSlider
