import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { useExpenses } from '../../context/ExpensesContext'
import { useTheme } from '../../context/ThemeContext'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function CategoryPieChart() {
  const { expenses } = useExpenses()
  const { resolvedTheme } = useTheme()
  const items = (expenses || []).filter((e) => !e.type || e.type === 'expense')

  const totalsByCategory = items.reduce((acc, e) => {
    const cat = e.category || 'Other'
    const amount = Number(e.amount) || 0
    acc[cat] = (acc[cat] || 0) + amount
    return acc
  }, {})

  const labels = Object.keys(totalsByCategory)
  const values = Object.values(totalsByCategory)
  const hasData = values.length > 0

  const data = {
    labels: hasData ? labels : ['No data'],
    datasets: [
      {
        data: hasData ? values : [1],
        backgroundColor: hasData
          ? [
              '#9b4dff',
              '#31d158',
              '#fbc02d',
              '#e53935',
              '#03a9f4',
              '#ff9800',
              '#8bc34a',
            ]
          : ['transparent'],
        borderColor: 'var(--border-color)',
        borderWidth: 1.5,
      },
    ],
  }

  const labelColor = 'var(--text-primary)'

  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: labelColor,
          boxWidth: 10,
          boxHeight: 10,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    maintainAspectRatio: false,
    backgroundColor: 'var(--bg-secondary)',
  }

  return (
    <div
      className="w-full p-4 rounded-2xl backdrop-blur-md md:hidden card-base"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div className="h-56 mb-4 flex items-center justify-center">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  )
}
