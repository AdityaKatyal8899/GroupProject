import { useDropdown } from './Dropdown'
import { cn } from '../../lib/cn'

export default function DropdownMenu({ className, children, align = 'left', width = 'min-w-[180px]' }) {
  const { open } = useDropdown()
  const alignment = align === 'right' ? 'right-0' : 'left-0'
  return (
    <div
      className={cn(
        'absolute top-full mt-2 z-50 origin-top rounded-2xl backdrop-blur-xl shadow-2xl shadow-primary/20 transition-all duration-200',
        alignment,
        width,
        open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none',
        className,
      )}
    >
      <div
        className="py-2 text-sm"
        style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', borderRadius: '1rem' }}
      >
        {children}
      </div>
    </div>
  )
}
