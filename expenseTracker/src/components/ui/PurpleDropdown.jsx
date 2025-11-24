import { useEffect, useMemo, useRef, useState } from 'react'
import './PurpleDropdown.css'

/*****
Props:
- options: string[]
- value: string
- onChange: (value: string) => void
- className?: string
- label?: string (optional, not rendered in control; for accessibility you can wrap externally)
*****/
export default function PurpleDropdown({ options = [], value, onChange, className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const currentLabel = useMemo(() => {
    if (!options?.length) return ''
    return options.includes(value) ? value : options[0]
  }, [options, value])

  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return
      if (!ref.current.contains(e.target)) setOpen(false)
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  function handleSelect(opt) {
    onChange?.(opt)
    setOpen(false)
  }

  return (
    <div ref={ref} className={`select ${open ? 'open' : ''} ${className}`}>
      <div
        className="selected"
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{currentLabel}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="arrow" aria-hidden="true">
          <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
        </svg>
      </div>
      {open && (
        <div className="options" role="listbox">
          {options.map((opt) => (
            <div
              key={opt}
              className="option"
              role="option"
              aria-selected={opt === currentLabel}
              onClick={(e) => {
                e.stopPropagation()
                handleSelect(opt)
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
