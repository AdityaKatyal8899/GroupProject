import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext({ showToast: () => {} })

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((type, message) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, type, message }])
    // auto-dismiss after 3s
    window.setTimeout(() => remove(id), 3000)
  }, [remove])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast stack at top center */}
      <div className="fixed inset-x-0 top-3 z-[2000] flex justify-center pointer-events-none">
        <div className="space-y-2 p-2 w-full max-w-md">
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onClose={() => remove(t.id)} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

function Toast({ type, message, onClose }) {
  const palette = {
    success: {
      base: 'bg-green-100 dark:bg-green-900 border-green-500 dark:border-green-700 text-green-900 dark:text-green-100',
      icon: 'text-green-600',
    },
    info: {
      base: 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-700 text-blue-900 dark:text-blue-100',
      icon: 'text-blue-600',
    },
    warning: {
      base: 'bg-yellow-100 dark:bg-yellow-900 border-yellow-500 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100',
      icon: 'text-yellow-600',
    },
    error: {
      base: 'bg-red-100 dark:bg-red-900 border-red-500 dark:border-red-700 text-red-900 dark:text-red-100',
      icon: 'text-red-600',
    },
  }
  const colors = palette[type] || palette.info

  return (
    <div
      role="alert"
      className={`pointer-events-auto ${colors.base} border-l-4 p-2 rounded-lg flex items-center transition duration-300 ease-in-out hover:opacity-95 transform hover:scale-[1.02] shadow-sm`}
      style={{ backgroundClip: 'padding-box', borderRadius: 12 }}
    >
      <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className={`h-5 w-5 flex-shrink-0 mr-2 ${colors.icon}`} xmlns="http://www.w3.org/2000/svg">
        <path d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <p className="text-xs font-semibold flex-1">{message}</p>
      <button onClick={onClose} className="ml-2 text-xs px-2 py-1 rounded-md bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20">
        Close
      </button>
    </div>
  )
}

export default ToastContext
