/**
 * COMPONENT: TrendLineChart
 * Purpose: Line chart for high-risk patient trends over 6 months.
 * Library: Chart.js via react-chartjs-2 (Line)
 * Props:
 *  - data: Array<{ month: string, diabetes: number, hypertension: number, cvd: number }>
 * Colors:
 *  - Diabetes: Blue (#3B82F6)
 *  - Hypertension: Red (#EF4444)
 *  - CVD: Purple (#8B5CF6)
 * Used on: DashboardPage
 */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const TrendLineChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Diabetes',
        data: data.map(d => d.diabetes),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Hypertension',
        data: data.map(d => d.hypertension),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'CVD',
        data: data.map(d => d.cvd),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          padding: 20,
          font: { size: 12, weight: '600' }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 } }
      },
    },
  }

  return (
    <div className="h-64 w-full">
      <Line data={chartData} options={options} />
    </div>
  )
}
export default TrendLineChart
