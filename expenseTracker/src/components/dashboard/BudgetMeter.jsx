import { useMemo } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { useExpenses } from '../../context/ExpensesContext'
import { calculateBudgetPercentage, calculateTotalSpent } from '../../lib/financeUtils'

export default function BudgetMeter() {
  const { monthlyBudget, currency } = useFinance()
  const { expenses } = useExpenses()

  const { pct, spent } = useMemo(() => {
    const p = calculateBudgetPercentage(expenses, monthlyBudget)
    const s = calculateTotalSpent(expenses)
    return { pct: Math.round(p), spent: s }
  }, [expenses, monthlyBudget])

  const budget = monthlyBudget || 0
  const barColor = pct < 50 ? 'rgba(49,209,88,0.9)' : pct <= 75 ? 'rgba(251,192,45,0.95)' : 'rgba(229,57,53,0.95)'

  return (
    <div className="card-base p-6">
      <div className="h1-heading text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Budget Progress
      </div>
      <div className="space-y-3">
        {/* Zones background */}
        <div className="w-full h-4 rounded-full relative">
          <div className="absolute inset-0 flex">
            <div className="h-full" style={{ width: '50%', background: 'rgba(49,209,88,0.25)' }} />
            <div className="h-full" style={{ width: '25%', background: 'rgba(251,192,45,0.25)' }} />
            <div className="h-full" style={{ width: '25%', background: 'rgba(229,57,53,0.25)' }} />
          </div>
          {/* Foreground progress (color-coded) */}
          <div
            className="h-full relative rounded-full"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(167deg, ${barColor} 0%, ${barColor} 100%)`
            }}
          />
        </div>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          You have spent{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{currency}{spent.toFixed(2)}</span>
          {budget > 0 && (
            <>
              {' '}
              of <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{currency}{budget.toFixed(2)}</span> ({pct}%)
            </>
          )}
        </div>
      </div>
    </div>
  )
}
