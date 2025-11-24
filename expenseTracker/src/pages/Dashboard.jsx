import { Wallet, PiggyBank, CircleDollarSign, Banknote } from 'lucide-react'
import SummaryCard from '../components/dashboard/SummaryCard'
import TrendChart from '../components/dashboard/TrendChart'
import SavingsCircle from '../components/dashboard/SavingsCircle'
import BudgetMeter from '../components/dashboard/BudgetMeter'
import { useFinance } from '../context/FinanceContext'
import SavingsCard from '../components/dashboard/SavingsCard'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { monthlyIncome, monthlyBudget, totalSpent, totalSavings, remainingMoney } = useFinance()
  const navigate = useNavigate()
  
  return (
    <div className="space-y-6">
      {/* Shared header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="h1-heading text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => navigate('/expenses?saving=1')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-primary/20 primary-button"
        >
          Add + 
        </button>
      </div>

      {/* Desktop layout (unchanged) */}
      <div className="hidden md:block space-y-6">
        {/* Summary row: income/budget/spent/remaining + savings card (live data from context) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard title="Income" value={`$${Number(monthlyIncome || 0).toFixed(2)}`} icon={Banknote} />
          <SummaryCard title="Budget" value={`$${Number(monthlyBudget || 0).toFixed(2)}`} icon={PiggyBank} />
          <SummaryCard title="Spent" value={`$${Number(totalSpent || 0).toFixed(2)}`} icon={Wallet} />
          <SummaryCard title="Remaining Money" value={`$${Number(remainingMoney || 0).toFixed(2)}`} icon={CircleDollarSign} />
          <SavingsCard amount={Number(totalSavings || 0)} />
        </div>

        {/* Main analytics: TrendChart (2fr) + SavingsCircle (1fr) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <TrendChart />
          </div>
          <div className="lg:col-span-1">
            <SavingsCircle />
          </div>
        </div>

        {/* Recent Transactions (no dummy data) */}
        <div className="card-base p-4">
          <div className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Recent Transactions
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No transactions to show yet.
          </div>
        </div>
      </div>

      {/* Mobile layout: cards -> trend graph -> transactions */}
      <div className="flex flex-col space-y-6 md:hidden">
        {/* Summary cards: 2-column compact grid on mobile (live data from context) */}
        <div className="grid grid-cols-2 gap-4">
          <SummaryCard title="Income" value={`$${Number(monthlyIncome || 0).toFixed(2)}`} icon={Banknote} />
          <SummaryCard title="Budget" value={`$${Number(monthlyBudget || 0).toFixed(2)}`} icon={PiggyBank} />
          <SummaryCard title="Spent" value={`$${Number(totalSpent || 0).toFixed(2)}`} icon={Wallet} />
          <SummaryCard title="Remain" value={`$${Number(remainingMoney || 0).toFixed(2)}`} icon={CircleDollarSign} />
        </div>

        {/* Mobile TrendChart container with extra padding and height */}
        <div
          className="w-full min-h-[260px] relative rounded-2xl p-3 card-base"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <TrendChart />
        </div>

        {/* Recent Transactions on mobile (no dummy data) */}
        <div className="card-base p-4">
          <div className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Recent Transactions
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No transactions to show yet.
          </div>
        </div>
      </div>

      {/* Budget Meter (shared) */}
      <BudgetMeter />
    </div>
  )
}
