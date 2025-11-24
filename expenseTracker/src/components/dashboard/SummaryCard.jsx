import { cn } from '../../lib/cn'

export default function SummaryCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-xl p-3 space-y-1 card-base md:p-4">
      {/* Mobile layout: icon before title */}
      <div className="md:hidden space-y-1">
        <div className="flex items-center gap-2">
          {Icon ? (
            <div
              className="h-5 w-5 rounded-lg flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--brand-purple) 12%, transparent)' }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: 'var(--brand-purple)' }} />
            </div>
          ) : null}
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </h3>
        </div>
        <div
          className="text-sm font-semibold md:text-2xl md:mt-1"
          style={{ fontFamily: 'Work Sans, ui-sans-serif, system-ui, sans-serif' }}
        >
          {value}
        </div>
      </div>

      {/* Desktop layout: original alignment */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </div>
          <div
            className="text-2xl font-semibold mt-1"
            style={{ fontFamily: 'Work Sans, ui-sans-serif, system-ui, sans-serif' }}
          >
            {value}
          </div>
        </div>
        <div
          className={cn('w-10 h-10 rounded-xl grid place-items-center')}
          style={{ background: 'color-mix(in srgb, var(--brand-purple) 12%, transparent)', color: 'var(--brand-purple)' }}
        >
          {Icon ? <Icon size={20} /> : null}
        </div>
      </div>
    </div>
  )
}
