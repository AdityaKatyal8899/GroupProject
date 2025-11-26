import { useEffect, useMemo, useRef, useState } from 'react'
import PurpleDropdown from '../ui/PurpleDropdown'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  BarChart,
  Bar,
  LabelList,
  Cell,
} from 'recharts'
import { useExpenses } from '../../context/ExpensesContext'
import { getDailyTotals } from '../../lib/expenseUtils'
import { useFinance } from '../../context/FinanceContext'
import { useSavings } from '../../context/SavingsContext'
import { calculateSavingsTrend } from '../../lib/financeUtils'
import { useTheme } from '../../context/ThemeContext'
import { apiFetch } from '../../lib/api'

export default function TrendChart() {
  const [range, setRange] = useState('Week')
  const [mode, setMode] = useState('Line') // 'Line' | 'Bar'
  const containerRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [dims, setDims] = useState({ width: 0, height: 0 })
  const { expenses } = useExpenses()
  const { savings } = useSavings()
  const dailyExpenses = useMemo(() => getDailyTotals(expenses || []), [expenses])
  const dailySavings = useMemo(() => calculateSavingsTrend(savings || []), [savings])
  const { monthlyBudget, currency } = useFinance()
  const { resolvedTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'
  const axisColor = 'var(--text-secondary)'
  const gridColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'

  // Category color palettes
  const lightColors = ['#a5b4fc','#86efac','#fde68a','#fca5a5','#93c5fd','#fcd34d','#f9a8d4']
  const darkColors = ['#6366f1','#22c55e','#eab308','#ef4444','#3b82f6','#f97316','#a855f7']

  const data = useMemo(() => {
    const map = new Map()
    dailyExpenses.forEach((d) => {
      map.set(d.day, { day: d.day, expenses: d.amount, savings: 0 })
    })
    dailySavings.forEach((d) => {
      const existing = map.get(d.day) || { day: d.day, expenses: 0, savings: 0 }
      existing.savings = d.savings
      map.set(d.day, existing)
    })
    return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => map.get(day) || { day, expenses: 0, savings: 0 })
  }, [dailyExpenses, dailySavings])
  // Backend-fed histogram summary
  const [summary, setSummary] = useState([])
  const [loadingSummary, setLoadingSummary] = useState(false)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setSummary([])
      return
    }
    const period = (range || 'Week').toLowerCase()
    setLoadingSummary(true)
    apiFetch(`/api/expenses/summary?token=${encodeURIComponent(token)}&period=${encodeURIComponent(period)}`)
      .then(async (res) => {
        let json = null
        try { json = await res.json() } catch {}
        if (!res.ok) throw new Error((json && (json.message || json.error)) || 'Failed to load summary')
        // Accept shapes: {data:{items:[...]}} (preferred), {summary:[...]}, or array directly
        const items = (json && json.data && Array.isArray(json.data.items))
          ? json.data.items
          : (Array.isArray(json?.summary) ? json.summary : (Array.isArray(json) ? json : []))
        setSummary(items)
      })
      .catch((e) => {
        // console.error('[histogram] summary load error', e)
        setSummary([])
      })
      .finally(() => setLoadingSummary(false))
  }, [range, expenses])

  // Transform summary to the exact shape required by BarChart
  const barChartData = useMemo(() => {
    if (!Array.isArray(summary) || summary.length === 0) return []
    const budget = Number(monthlyBudget ?? 0)
    const mapped = summary.map((item) => {
      const category = item.category || item.name || 'Other'
      const amount = Number(item.amount ?? item.total_amount ?? item.value ?? 0)
      const pctRaw = (typeof item.percent === 'number' ? item.percent : item.percentage_of_budget)
      const percentage = typeof pctRaw === 'number' && isFinite(pctRaw)
        ? Math.max(0, Math.min(100, pctRaw))
        : (budget > 0 ? Math.min(100, (amount / budget) * 100) : 0)
      return { category, percentage: Math.round(percentage * 10) / 10, amount }
    })
    // Sort descending by percentage to mirror previous behavior
    mapped.sort((a, b) => b.percentage - a.percentage)
    return mapped
  }, [summary, monthlyBudget])

  // Debug: verify data shape
  useEffect(() => {
    // eslint-disable-next-line no-console
    // console.log('barChartData:', barChartData)
  }, [barChartData])

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return
    const el = containerRef.current
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setDims({ width, height })
      setReady(width > 0 && height > 0)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Determine if line data exists (avoid rendering with dummy zeros)
  const hasLineData = useMemo(() => {
    return (Array.isArray(expenses) && expenses.length > 0) || (Array.isArray(savings) && savings.length > 0)
  }, [expenses, savings])

  return (
    <div className="card-base p-4 md:p-6 h-full">
      {/* Top bar: compact title + compact controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-2 md:mb-4">
        <h3 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
          Spending Overview
        </h3>
        <div className="grid grid-cols-1 sm:flex sm:flex-row gap-2 sm:items-center sm:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Time Range</span>
            <PurpleDropdown className="compact" options={["Week","Month","Year"]} value={range} onChange={setRange} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Chart Type</span>
            <PurpleDropdown className="compact" options={["Line","Bar"]} value={mode} onChange={setMode} />
          </div>
        </div>
      </div>
      <div
        ref={containerRef}
        className="w-full min-h-[280px] md:min-h-[340px] relative"
        style={{ minHeight: 280, width: '100%' }}
      >
        {ready && mode === 'Line' && (
          <ResponsiveContainer width="100%" minWidth={0} minHeight={280} height="100%">
            {(hasLineData && dims.width > 0 && dims.height > 0) ? (
            <AreaChart data={data} margin={{ left: 8, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-purple)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--brand-purple)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="day"
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={{ stroke: axisColor + '33' }}
                tickLine={false}
              />
              <YAxis
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={{ stroke: axisColor + '33' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#121212' : '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  color: 'var(--text-primary)',
                }}
                labelStyle={{ color: 'var(--text-secondary)' }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 6, color: 'var(--text-primary)', fontSize: 12 }}
              />
              {monthlyBudget > 0 && (
                <ReferenceLine
                  y={monthlyBudget}
                  stroke="var(--text-secondary)"
                  strokeDasharray="4 4"
                  opacity={0.4}
                />
              )}
              <Area
                type="monotone"
                name="Spending"
                dataKey="expenses"
                stroke="var(--brand-purple)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPurple)"
                activeDot={{ r: 5 }}
              />
              <Area
                type="monotone"
                name="Savings"
                dataKey="savings"
                stroke="var(--success-green)"
                strokeWidth={2}
                fillOpacity={0}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="empty-chart">No data yet</div>
              </div>
            )}
          </ResponsiveContainer>
        )}
        {ready && mode === 'Bar' && (
          <ResponsiveContainer width="100%" minWidth={0} minHeight={280} height="100%">
            {(!loadingSummary && (barChartData.length === 0 || dims.width <= 0 || dims.height <= 0)) ? (
              <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="empty-chart">No data yet</div>
              </div>
            ) : (
            <BarChart
              data={barChartData}
              margin={{ left: 8, right: 8, top: 12, bottom: 8 }}
              barCategoryGap={20}
              barGap={8}
            >
              <defs>
                {/* solid colors only for bars; keep overspend as solid red */}
              </defs>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="category"
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={{ stroke: axisColor + '33' }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={{ stroke: axisColor + '33' }}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null
                  const p = payload[0]
                  const percent = typeof p.value === 'number' ? p.value : 0
                  const amt = p && p.payload && typeof p.payload.amount === 'number' ? p.payload.amount : 0
                  return (
                    <div style={{ background: isDark ? '#121212' : '#ffffff', border: '1px solid var(--border-color)', borderRadius: 12, padding: 8, color: 'var(--text-primary)' }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Amount: {currency}{amt.toFixed(2)}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Percent: {percent}%</div>
                    </div>
                  )
                }}
              />
              <Bar dataKey="percentage" isAnimationActive animationDuration={500} radius={[8,8,0,0]}>
                <LabelList dataKey="percentage" position="top" formatter={(v) => `${v}%`} style={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                {barChartData.map((entry, i) => {
                  const palette = isDark ? darkColors : lightColors
                  const baseColor = palette[i % palette.length]
                  const overspend = entry.percentage > 40
                  return <Cell key={`cell-${entry.category}`} fill={overspend ? '#ef4444' : baseColor} />
                })}
              </Bar>
            </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
