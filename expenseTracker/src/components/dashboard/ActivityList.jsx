export default function ActivityList() {
  const items = [
    { id: 1, label: 'Grocery at FreshMart', amount: '-$42.50', time: 'Today' },
    { id: 2, label: 'Uber Ride', amount: '-$12.80', time: 'Yesterday' },
    { id: 3, label: 'Salary', amount: '+$2,500.00', time: 'Oct 10' },
  ]
  return (
    <div className="card-base p-4">
      <div className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        Recent Activities
      </div>
      <div className="space-y-3">
        {items.map((i) => (
          <div
            key={i.id}
            className="flex items-center justify-between py-2 border-b last:border-b-0"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div style={{ color: 'var(--text-secondary)' }}>{i.label}</div>
            <div
              className="text-sm"
              style={{ color: i.amount.startsWith('+') ? 'var(--success-green)' : 'var(--danger-red)' }}
            >
              {i.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
