import { toNumber } from './expenseUtils'

export function calculateTotalSpent(expenses) {
  return (expenses || []).reduce((sum, e) => sum + toNumber(e.amount), 0)
}

export function calculateRemaining(expenses, budget = 0) {
  const total = calculateTotalSpent(expenses)
  return toNumber(budget) - total
}

export function calculateSavings(expenses, income = 0) {
  const total = calculateTotalSpent(expenses)
  return toNumber(income) - total
}

export function calculateBudgetPercentage(expenses, budget = 0) {
  const total = calculateTotalSpent(expenses)
  const b = Math.max(1, toNumber(budget))
  return Math.min(100, Math.max(0, (total / b) * 100))
}

export function getBudgetColor(percentage) {
  const p = Math.max(0, Math.min(100, Number(percentage) || 0))
  if (p < 50) return 'green'
  if (p < 75) return 'yellow'
  return 'red'
}

// Savings helpers
export function calculateTotalSavings(savings) {
  return (savings || []).reduce((sum, s) => sum + toNumber(s.amount), 0)
}

export function calculateNetAvailable(income, expenses, savings) {
  const totalSpent = calculateTotalSpent(expenses)
  const totalSaved = calculateTotalSavings(savings)
  return toNumber(income) - (totalSpent + totalSaved)
}

export function calculateSavingsTrend(savings) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const totals = new Array(7).fill(0)
  ;(savings || []).forEach((s) => {
    if (!s.date) return
    const dt = new Date(s.date)
    if (Number.isNaN(dt.getTime())) return
    totals[dt.getDay()] += toNumber(s.amount)
  })
  const order = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  return order.map((label) => {
    const idx = days.indexOf(label)
    return { day: label, savings: Math.round(totals[idx] * 100) / 100 }
  })
}

export function calculateSavingsRemaining(savings, goal = 0) {
  const total = calculateTotalSavings(savings)
  return toNumber(goal) - total
}
