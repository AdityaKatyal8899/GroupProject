import { useState } from 'react'
import PurpleDropdown from '../components/ui/PurpleDropdown'

export default function Reports() {
  const [category, setCategory] = useState('All Categories')
  const [groupBy, setGroupBy] = useState('Group by: Month')

  return (
    <div className="space-y-6">
      {/* Heading */}
      <h1 className="h1-heading text-2xl font-bold">Reports</h1>

      {/* Filters Bar */}
      <div className="card-base p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input type="text" placeholder="Date Range" className="rounded-lg px-3 py-2" />
          <div>
            <PurpleDropdown
              options={["All Categories", "Food", "Transport", "Bills"]}
              value={category}
              onChange={(opt) => setCategory(opt)}
            />
          </div>
          <div>
            <PurpleDropdown
              options={["Group by: Month", "Group by: Week", "Group by: Day"]}
              value={groupBy}
              onChange={(opt) => setGroupBy(opt)}
            />
          </div>
        </div>
      </div>

      {/* Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-base p-4">
          <div className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Category Breakdown
          </div>
          <div className="h-64 rounded-xl border" style={{ borderColor: 'var(--border-color)' }} />
        </div>
        <div className="card-base p-4">
          <div className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Spending Trend
          </div>
          <div className="h-64 rounded-xl border" style={{ borderColor: 'var(--border-color)' }} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-base p-4">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Highest Category
          </div>
          <div className="text-xl mt-1">--</div>
        </div>
        <div className="card-base p-4">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Total Spent
          </div>
          <div className="text-xl mt-1">--</div>
        </div>
        <div className="card-base p-4">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Average Daily Spend
          </div>
          <div className="text-xl mt-1">--</div>
        </div>
      </div>
    </div>
  )
}
