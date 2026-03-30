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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
)

const SHAPBarChart = ({ factors = [] }) => {
  // Sort factors by absolute impact to show most important ones
  const sortedFactors = [...factors]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 7) // Top 7 factors

  const chartData = {
    labels: sortedFactors.map(f => f.display_label || f.feature),
    datasets: [
      {
        label: 'Risk Impact',
        data: sortedFactors.map(f => f.impact),
        backgroundColor: sortedFactors.map(f => 
          f.impact > 0 ? 'rgba(244, 63, 94, 0.8)' : 'rgba(16, 185, 129, 0.8)'
        ),
        borderColor: sortedFactors.map(f => 
          f.impact > 0 ? '#f43f5e' : '#10b981'
        ),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    indexAxis: 'y', // Horizontal bars
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const val = context.raw
            return val > 0 ? `Increases risk by ${val.toFixed(1)}%` : `Decreases risk by ${Math.abs(val).toFixed(1)}%`
          }
        }
      },
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 } },
        title: {
          display: true,
          text: 'Impact Score',
          font: { size: 10, weight: 'bold' }
        }
      },
      y: {
        grid: { display: false },
        ticks: { 
          font: { size: 12, weight: '500' },
          color: '#334155'
        }
      },
    },
  }

  return (
    <div className="flex h-full flex-col">
      <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Why This Risk Score?</h4>
      <div className="flex-grow">
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-4 flex gap-4 text-[10px] font-bold uppercase">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-rose-500" />
          <span className="text-rose-600">Increases Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-emerald-600">Decreases Risk</span>
        </div>
      </div>
    </div>
  )
}
export default SHAPBarChart
