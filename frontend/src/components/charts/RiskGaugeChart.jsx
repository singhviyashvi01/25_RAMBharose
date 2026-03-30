/**
 * COMPONENT: RiskGaugeChart
 * Purpose: Semicircular gauge chart showing overall risk score (0-100%).
 * Library: Chart.js (Doughnut offset trick) or custom SVG arc
 * Props:
 *  - score: number (0-100)
 *  - tier: "High" | "Medium" | "Low"
 * Shows bold score number in the center.
 * Used on: PatientDetailPage (one per condition)
 */
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const RiskGaugeChart = ({ score = 0, tier = 'Low' }) => {
  const colors = {
    High: '#f43f5e',   // rose-500
    Medium: '#f59e0b', // amber-500
    Low: '#10b981',    // emerald-500
  }

  const currentColor = colors[tier] || colors.Low

  const data = {
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [currentColor, '#f1f5f9'], // colored part vs light background
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
        cutout: '80%',
        borderRadius: 10,
      },
    ],
  }

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    maintainAspectRatio: false,
    responsive: true,
  }

  return (
    <div className="relative flex h-32 w-full flex-col items-center justify-center">
      <div className="h-full w-full">
        <Doughnut data={data} options={options} />
      </div>
      <div className="absolute top-1/2 mt-4 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{Math.round(score)}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{tier} Risk</span>
      </div>
    </div>
  )
}
export default RiskGaugeChart
