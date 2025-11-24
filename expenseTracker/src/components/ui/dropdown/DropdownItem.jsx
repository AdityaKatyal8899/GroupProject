import { useDropdown } from './Dropdown'
import { cn } from '../../lib/cn'

export default function DropdownItem({ children, onSelect, className }) {
  const { close } = useDropdown()

  function handleClick() {
    onSelect?.()
    close()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full px-4 py-2 text-left transition-colors duration-150 rounded-xl',
        className,
      )}
      style={{ color: 'var(--text-secondary)' }}
    >
      {children}
    </button>
  )
}
