export function toNumber(n) {
  const x = typeof n === 'string' ? parseFloat(n) : Number(n)
  return Number.isFinite(x) ? x : 0
}

export function parseDateISO(d) {
  const dt = d ? new Date(d) : null
  return dt && !isNaN(dt) ? dt : null
}

export function sameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function getTotalSpent(expenses) {
  return (expenses || []).reduce((sum, e) => sum + toNumber(e.amount), 0)
}

export function getDailyTotals(expenses) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const totals = new Array(7).fill(0)
  ;(expenses || []).forEach((e) => {
    const dt = parseDateISO(e.date)
    if (!dt) return
    const idx = dt.getDay()
    totals[idx] += toNumber(e.amount)
  })
  // Return Mon..Sun order as in spec
  const order = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const remap = order.map((label) => {
    const idx = days.indexOf(label)
    return { day: label, amount: Math.round(totals[idx] * 100) / 100 }
  })
  return remap
}

export function getMonthlyTotals(expenses) {
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const totals = new Array(12).fill(0)
  ;(expenses || []).forEach((e) => {
    const dt = parseDateISO(e.date)
    if (!dt) return
    totals[dt.getMonth()] += toNumber(e.amount)
  })
  return labels.map((m, i) => ({ month: m, amount: Math.round(totals[i] * 100) / 100 }))
}

export function getCategoryTotals(expenses) {
  const map = {}
  ;(expenses || []).forEach((e) => {
    const key = (e.category || 'Uncategorized')
    map[key] = (map[key] || 0) + toNumber(e.amount)
  })
  return Object.entries(map).map(([category, amount]) => ({ category, amount }))
}

export function calculateSavingsBurnt(expenses, monthlyBudget = 20000) {
  const now = new Date()
  const monthSpent = (expenses || []).reduce((sum, e) => {
    const dt = parseDateISO(e.date)
    if (!dt) return sum
    if (sameMonth(dt, now)) return sum + toNumber(e.amount)
    return sum
  }, 0)
  const budget = toNumber(monthlyBudget) || 1
  const pct = Math.min(100, Math.max(0, (monthSpent / budget) * 100))
  return { percent: Math.round(pct), monthSpent }
}
