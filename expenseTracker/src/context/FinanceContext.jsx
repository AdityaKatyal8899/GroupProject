import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, apiBase } from '../lib/api'
import { useExpenses } from './ExpensesContext'
import { useSavings } from './SavingsContext'

const FinanceContext = createContext()
const STORAGE_KEY = 'expensewise.finance.v1'

export function FinanceProvider({ children }) {
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [monthlyBudget, setMonthlyBudget] = useState(0)
  const [notifications, setNotifications] = useState({ budgetAlert: false, largeExpense: false, monthlyEmail: false })
  const [currency, setCurrency] = useState('$')
  const expCtx = (typeof useExpenses === 'function') ? useExpenses() : null
  const savCtx = (typeof useSavings === 'function') ? useSavings() : null
  const expenses = expCtx && Array.isArray(expCtx.expenses) ? expCtx.expenses : []
  const savings = savCtx && Array.isArray(savCtx.savings) ? savCtx.savings : []

  // Load initial values from backend only when a token exists
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setMonthlyIncome(0)
      setMonthlyBudget(0)
      return
    }
    ;(async () => {
      try {
        await reloadSettingsFromAPI(token)
      } catch {
        setMonthlyIncome(0)
        setMonthlyBudget(0)
      }
    })()
  }, [])

  // Derived totals (safe defaults)
  const totalSpent = useMemo(() => {
    if (!Array.isArray(expenses)) return 0
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  }, [expenses])

  // Net savings balance
  const totalSavings = useMemo(() => {
    if (!Array.isArray(savings)) return 0
    return savings.reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
  }, [savings])

  // Rules-driven remaining calculations
  const expensesNotFromSavings = useMemo(() => {
    if (!Array.isArray(expenses)) return 0
    return expenses
      .filter((e) => !e?.paidFromSavings)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  }, [expenses])

  const savingsAdds = useMemo(() => {
    if (!Array.isArray(savings)) return 0
    return savings
      .filter((s) => (Number(s.amount) || 0) > 0)
      .reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
  }, [savings])

  const remainingIncome = useMemo(() => {
    const income = Number(monthlyIncome) || 0
    const deduction = Number(expensesNotFromSavings) + Number(savingsAdds)
    return Math.max(0, income - deduction)
  }, [monthlyIncome, expensesNotFromSavings, savingsAdds])

  const remainingBudget = useMemo(() => {
    const budget = Number(monthlyBudget) || 0
    const deduction = Number(expensesNotFromSavings) + Number(savingsAdds)
    return Math.max(0, budget - deduction)
  }, [monthlyBudget, expensesNotFromSavings, savingsAdds])

  // Remaining cash from income after accounting for planned budget and actual savings
  const remainingMoney = useMemo(() => {
    const income = Number(monthlyIncome) || 0
    const budget = Number(monthlyBudget) || 0
    const savingsBal = Number(totalSavings) || 0
    return income - budget - savingsBal
  }, [monthlyIncome, monthlyBudget, totalSavings])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ monthlyIncome, monthlyBudget }))
    } catch {}
  }, [monthlyIncome, monthlyBudget])

  async function saveSettingsToAPI({ income, budget, notifications: notif, currency: cur }, token) {
    const payload = { token, income, budget, notifications: notif }
    if (cur) payload.currency = cur
    console.log('[settings] Saving payload =>', payload)
    let res = await apiFetch('/api/settings/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    // Fallback to non-/api path if 404 or not ok
    if (!res.ok && res.status === 404) {
      res = await apiFetch('/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    let data = null
    try {
      data = await res.json()
    } catch {}
    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || res.statusText || 'Failed to save settings'
      console.error('[settings] Save error =>', res.status, msg, data)
      throw new Error(msg)
    }
    console.log('[settings] Save response =>', data)
    return data
  }

  async function reloadSettingsFromAPI(token) {
    let url = `${apiBase}/api/settings/get?token=${encodeURIComponent(token)}`
    console.log('[settings] Loading from =>', url)
    let res = await apiFetch(url)
    if (!res.ok && res.status === 404) {
      url = `${apiBase}/settings/get?token=${encodeURIComponent(token)}`
      console.log('[settings] Retrying load from =>', url)
      res = await apiFetch(url)
    }
    let json = null
    try {
      json = await res.json()
    } catch {}
    if (!res.ok) {
      const msg = (json && (json.message || json.error)) || res.statusText || 'Failed to load settings'
      console.error('[settings] Load error =>', res.status, msg, json)
      throw new Error(msg)
    }
    const data = json?.data || {}
    if (typeof data.income === 'number') setMonthlyIncome(data.income)
    if (typeof data.budget === 'number') setMonthlyBudget(data.budget)
    if (data.notifications && typeof data.notifications === 'object') setNotifications({
      budgetAlert: !!data.notifications.budgetAlert,
      largeExpense: !!data.notifications.largeExpense,
      monthlyEmail: !!data.notifications.monthlyEmail,
    })
    if (data.currency && typeof data.currency === 'string') setCurrency(data.currency || '$')
    console.log('[settings] Loaded data =>', data)
    return data
  }

  const value = useMemo(
    () => ({
      monthlyIncome,
      monthlyBudget,
      notifications,
      currency,
      totalSpent,
      totalSavings,
      remainingIncome,
      remainingBudget,
      remainingMoney,
      setMonthlyIncome,
      setMonthlyBudget,
      setNotifications,
      setCurrency,
      saveSettingsToAPI,
      reloadSettingsFromAPI,
      refreshSettings: reloadSettingsFromAPI,
    }),
    [monthlyIncome, monthlyBudget, notifications, currency, totalSpent, totalSavings, remainingMoney]
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  return useContext(FinanceContext)
}
