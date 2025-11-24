import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const SavingsContext = createContext()
const STORAGE_KEY = 'expensewise_savings'

export function SavingsProvider({ children }) {
  const [savings, setSavings] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savings))
    } catch {}
  }, [savings])

  function addSaving(entry) {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
    const payload = { id, type: 'saving', ...entry }
    setSavings((prev) => [payload, ...prev])
    return id
  }

  function editSaving(id, updated) {
    setSavings((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)))
  }

  function deleteSaving(id) {
    setSavings((prev) => prev.filter((item) => item.id !== id))
  }

  function clearSavings() {
    setSavings([])
  }

  function addSavingFromRecovery(amount) {
    const value = Number(amount) || 0
    if (!value) return
    const today = new Date().toISOString().slice(0, 10)
    addSaving({ amount: value, date: today, note: 'Recovered from expense' })
  }

  function spendFromSavings(amount) {
    const value = Number(amount) || 0
    if (!value) return
    const today = new Date().toISOString().slice(0, 10)
    addSaving({ amount: -Math.abs(value), date: today, note: 'Spent from savings' })
  }

  const value = useMemo(
    () => ({ savings, addSaving, editSaving, deleteSaving, clearSavings, addSavingFromRecovery, spendFromSavings }),
    [savings],
  )

  return <SavingsContext.Provider value={value}>{children}</SavingsContext.Provider>
}

export function useSavings() {
  return useContext(SavingsContext)
}
