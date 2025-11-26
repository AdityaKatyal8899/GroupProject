import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const ExpensesContext = createContext()
const STORAGE_KEY = 'expensewise.expenses.v1'

export function ExpensesProvider({ children }) {
  const [expenses, setExpenses] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
    } catch {}
  }, [expenses])

  function addExpense(expense) {
    const id = Date.now().toString()
    const item = { id, type: 'expense', ...expense }
    setExpenses((prev) => [item, ...prev])
    return id
  }

  function editExpense(id, updatedExpense) {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updatedExpense } : e)))
  }

  function deleteExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  function clearExpenses() {
    setExpenses([])
  }

  function refreshExpenses() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const next = raw ? JSON.parse(raw) : []
      setExpenses(Array.isArray(next) ? next : [])
    } catch {
      setExpenses([])
    }
  }

  function updateExpense(id, updatedExpense) {
    editExpense(id, updatedExpense)
  }

  function recoverExpense(id, amount) {
    const delta = Number(amount) || 0
    if (!delta) return
    setExpenses((prev) => {
      const updated = prev
        .map((e) => {
          if (e.id !== id) return e
          const current = Number(e.amount) || 0
          const next = current - delta
          if (next <= 0) return { ...e, amount: 0 }
          return { ...e, amount: next }
        })
        .filter((e) => (Number(e.amount) || 0) > 0)
      return updated
    })
  }

  function payExpenseFromSavings(id) {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, paidFromSavings: true } : e)),
    )
  }

  const value = useMemo(
    () => ({
      expenses,
      refreshExpenses,
      addExpense,
      updateExpense,
      editExpense,
      deleteExpense,
      clearExpenses,
      recoverExpense,
      payExpenseFromSavings,
    }),
    [expenses]
  )

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>
}

export function useExpenses() {
  return useContext(ExpensesContext)
}
