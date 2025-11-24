import { cn } from '../../lib/cn'

export default function SavingsCard({ amount }) {
  return (
    <div
      className={cn(
        'rounded-2xl p-6 shadow border',
        'hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300',
      )}
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'rgba(49,209,88,0.25)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Savings
          </div>
          <div className="text-2xl font-semibold mt-1" style={{ fontFamily: 'Work Sans, ui-sans-serif, system-ui, sans-serif' }}>
            ${amount.toFixed(2)}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>
            Total saved this month
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl grid place-items-center bg-green-500/20 text-green-400">
          <span className="text-lg font-bold">$</span>
        </div>
      </div>
    </div>
  )
}
