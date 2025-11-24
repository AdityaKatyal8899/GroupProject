import { useEffect, useRef } from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { useExpenses } from '../../context/ExpensesContext'
import { calculateBudgetPercentage } from '../../lib/financeUtils'
import { useFinance } from '../../context/FinanceContext'
import { getBudgetColor } from '../../lib/financeUtils'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function SavingsCircle({ budget: budgetProp }) {
  const { expenses } = useExpenses()
  const { monthlyBudget } = useFinance()
  const budget = budgetProp ?? monthlyBudget ?? 0
  const percent = calculateBudgetPercentage(expenses || [], budget)
  const remaining = 100 - Math.max(0, Math.min(100, percent))
  const ref = useRef()

  const data = {
    labels: ['Burnt', 'Remaining'],
    datasets: [
      {
        data: [percent, remaining],
        backgroundColor: [
          // gradient will be applied in afterDatasetsDraw
          '#6A0DAD',
          'rgba(255,255,255,0.4)'
        ],
        borderWidth: 0,
        cutout: '70%'
      },
    ],
  }

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    animation: {
      animateRotate: true,
      duration: 900,
      easing: 'easeOutQuart',
    },
  }

  useEffect(() => {
    if (!ref.current) return
    const chart = ref.current
    const ctx = chart.ctx
    const dataset = chart.config.data.datasets[0]
    const meta = chart.getDatasetMeta(0)
    const firstArc = meta.data[0]
    if (!firstArc) return
    // Create purple gradient for the burnt section
    const gradient = ctx.createLinearGradient(0, 0, chart.width, chart.height)
    gradient.addColorStop(0, '#6A0DAD')
    gradient.addColorStop(1, '#9d4edd')
    dataset.backgroundColor[0] = gradient
    chart.update('none')
  })

  const zone = getBudgetColor(percent)
  const glow = zone === 'green' ? '#4caf50' : zone === 'yellow' ? '#fbc02d' : '#e53935'

  return (
    <div className="card-base p-6 h-full relative" style={{ filter: `drop-shadow(0 0 10px ${glow}30)` }}>
      <h3 className="h1-heading text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Budget Burnt
      </h3>
      <div className="h-64 relative">
        <Doughnut ref={ref} data={data} options={options} />
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {Math.round(percent)}%
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Budget Burnt This Month
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
