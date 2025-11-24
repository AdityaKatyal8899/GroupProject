import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

const DropdownContext = createContext(null)

export function Dropdown({ children }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClick(event) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((prev) => !prev),
      close: () => setOpen(false),
    }),
    [open],
  )

  return (
    <DropdownContext.Provider value={value}>
      <div ref={containerRef} className="relative inline-flex">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function useDropdown() {
  const ctx = useContext(DropdownContext)
  if (!ctx) throw new Error('Dropdown components must be used within <Dropdown>')
  return ctx
}
