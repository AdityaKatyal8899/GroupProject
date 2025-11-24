import { forwardRef } from 'react'
import { useDropdown } from './Dropdown'
import { cn } from '../../lib/cn'

const DropdownTrigger = forwardRef(function DropdownTrigger({ className, children, ...props }, ref) {
  const { toggle } = useDropdown()
  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] primary-button',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
})

export default DropdownTrigger
