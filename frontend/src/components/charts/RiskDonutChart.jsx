/**
 * COMPONENT: RiskDonutChart
 * Purpose: Donut chart showing population risk distribution.
 * Library: Chart.js via react-chartjs-2 (Doughnut)
 * Props:
 *  - high: number — count of high-risk patients
 *  - medium: number
 *  - low: number
 * Colors: Red (#EF4444), Amber (#F59E0B), Green (#10B981)
 * Shows percentage legend below.
 * Used on: DashboardPage
 */
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const RiskDonutChart = ({ high = 0, medium = 0, low = 0 }) => {
  const total = high + medium + low
  
  const data = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [
      {
        data: [high, medium, low],
        backgroundColor: [
          '#f43f5e', // rose-500
          '#f59e0b', // amber-500
          '#10b981', // emerald-500
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 12,
        cutout: '70%',
      },
    ],
  }

  const options = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
      },
    },
    maintainAspectRatio: false,
  }

  return (
    <div className="flex h-full flex-col items-center gap-6">
      <div className="relative h-64 w-full">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-900">{total}</span>
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total</span>
        </div>
      </div>
      
      <div className="grid w-full grid-cols-3 gap-2">
        <div className="flex flex-col items-center rounded-xl bg-slate-50 p-3 border border-slate-100">
          <span className="text-xs font-bold text-rose-600 uppercase">High</span>
          <span className="text-lg font-bold text-slate-900">{Math.round((high/total)*100) || 0}%</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-slate-50 p-3 border border-slate-100">
          <span className="text-xs font-bold text-amber-600 uppercase">Med</span>
          <span className="text-lg font-bold text-slate-900">{Math.round((medium/total)*100) || 0}%</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-slate-50 p-3 border border-slate-100">
          <span className="text-xs font-bold text-emerald-600 uppercase">Low</span>
          <span className="text-lg font-bold text-slate-900">{Math.round((low/total)*100) || 0}%</span>
        </div>
      </div>
    </div>
  )
}
export default RiskDonutChart
