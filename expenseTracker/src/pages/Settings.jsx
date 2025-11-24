import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFinance } from '../context/FinanceContext'
import { useExpenses } from '../context/ExpensesContext'
import { useSavings } from '../context/SavingsContext'
import { useTheme } from '../context/ThemeContext'
import AnimatedCheckbox from '../components/ui/AnimatedCheckbox'
import PurpleDropdown from '../components/ui/PurpleDropdown'
import LoadingButton from '../components/common/LoadingButton'
import { apiFetch } from '../lib/api'

export default function Settings() {
  const navigate = useNavigate()
  const { monthlyIncome, monthlyBudget, notifications, saveSettingsToAPI, reloadSettingsFromAPI } = useFinance()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { clearExpenses } = useExpenses()
  const { clearSavings } = useSavings()

  // Local editable form state (only persisted on Save)
  const [currency, setCurrency] = useState('INR')
  const [formIncome, setFormIncome] = useState('')
  const [formBudget, setFormBudget] = useState('')
  const [formNotifications, setFormNotifications] = useState({ budgetAlert: false, largeExpense: false, monthlyEmail: false })
  const [savingSettings, setSavingSettings] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [localToast, setLocalToast] = useState({ show: false, type: 'success', message: '' })

  // Prefill form from backend/context values and local currency storage
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem('expensewise_currency')
      if (savedCurrency) setCurrency(savedCurrency)
    } catch {}
  }, [])

  useEffect(() => {
    // Sync latest loaded values into the form
    setFormIncome(String(Number(monthlyIncome || 0)))
    setFormBudget(String(Number(monthlyBudget || 0)))
    setFormNotifications({
      budgetAlert: !!(notifications && notifications.budgetAlert),
      largeExpense: !!(notifications && notifications.largeExpense),
      monthlyEmail: !!(notifications && notifications.monthlyEmail),
    })
  }, [monthlyIncome, monthlyBudget, notifications])

  // Safe, app-wide logout implementation (AuthContext alternative)
  const logout = () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('name')
      localStorage.removeItem('email')
      localStorage.removeItem('avatar')
      localStorage.removeItem('picture')
    } catch {}
    try { clearExpenses() } catch {}
    try { clearSavings() } catch {}
    navigate('/login', { replace: true })
  }

  const handleDeleteAccount = () => {
    // Placeholder until backend delete is implemented
    console.log('Delete account triggered — backend will be connected later')
  }

  async function handleSaveSettings() {
    // Validate local form values only when saving
    const incomeVal = Number(formIncome)
    const budgetVal = Number(formBudget)
    if (!Number.isFinite(incomeVal) || incomeVal < 0) {
      setLocalToast({ show: true, type: 'warning', message: 'Please enter a valid Monthly Income value.' })
      window.setTimeout(() => setLocalToast((t) => ({ ...t, show: false })), 2000)
      return
    }
    if (!Number.isFinite(budgetVal) || budgetVal < 0) {
      setLocalToast({ show: true, type: 'warning', message: 'Please enter a valid Monthly Budget value.' })
      window.setTimeout(() => setLocalToast((t) => ({ ...t, show: false })), 2000)
      return
    }

    if (savingSettings) return
    setSavingSettings(true)
    try {
      const token = localStorage.getItem('token') || 'test_user_123'
      await saveSettingsToAPI({ income: incomeVal, budget: budgetVal, notifications: formNotifications }, token)
      localStorage.setItem('expensewise_currency', currency)
      await reloadSettingsFromAPI(token)
      setLocalToast({ show: true, type: 'success', message: 'Settings updated successfully' })
    } catch (e) {
      setLocalToast({ show: true, type: 'error', message: e?.message || 'Failed to save settings' })
    } finally {
      window.setTimeout(() => setLocalToast((t) => ({ ...t, show: false })), 2000)
      setSavingSettings(false)
    }
  }

  async function handleResetDashboard() {
    if (resetting) return
    setResetting(true)
    try {
      const token = localStorage.getItem('token') || 'test_user_123'
      // 1) Clear backend data for this user
      await apiFetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      // 2) Persist 0 income/budget and false notifications
      const zeros = { income: 0, budget: 0, notifications: { budgetAlert: false, largeExpense: false, monthlyEmail: false } }
      await saveSettingsToAPI(zeros, token)
      // 3) Clear local UI state immediately
      clearExpenses()
      clearSavings()
      setFormIncome('0')
      setFormBudget('0')
      setFormNotifications({ budgetAlert: false, largeExpense: false, monthlyEmail: false })
      // 4) Reload context from backend so Dashboard syncs
      await reloadSettingsFromAPI(token)
      // 5) Toast
      setLocalToast({ show: true, type: 'success', message: 'Dashboard reset successfully' })
    } catch (e) {
      setLocalToast({ show: true, type: 'error', message: e?.message || 'Failed to reset' })
    } finally {
      window.setTimeout(() => setLocalToast((t) => ({ ...t, show: false })), 2000)
      setResetting(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 relative">
      <h1 className="h1-heading text-2xl font-bold">Settings</h1>

      {/* Appearance */}
      <section className="card-base p-6 space-y-4">
        <h2 className="font-semibold">Appearance</h2>
        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="theme"
              className="accent-[#9B4DFF]"
              checked={theme === 'light'}
              onChange={() => setTheme('light')}
            />
            <span>Light</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="theme"
              className="accent-[#6A0DAD]"
              checked={resolvedTheme === 'dark' && theme !== 'system'}
              onChange={() => setTheme('dark')}
            />
            <span>Dark</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="theme"
              className="accent-[#6A0DAD]"
              checked={theme === 'system'}
              onChange={() => setTheme('system')}
            />
            <span>System</span>
          </label>
        </div>
      </section>

      {/* Currency Settings */}
      <section className="card-base p-6 space-y-3">
        <h2 className="font-semibold">Currency Settings</h2>
        <div className="w-full max-w-xs">
          <PurpleDropdown
            options={["INR", "USD", "EUR", "GBP"]}
            value={currency}
            onChange={(opt) => setCurrency(opt)}
          />
        </div>
      </section>

      {/* Income & Budget */}
      <section className="card-base p-6 space-y-4">
        <h2 className="font-semibold">Income & Budget</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
          <div className="space-y-1">
            <label className="text-sm">Monthly Income</label>
            <input type="number" value={formIncome} onChange={(e) => setFormIncome(e.target.value)} placeholder="e.g. 50000" className="w-full rounded-lg px-3 py-2" />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Monthly Budget</label>
            <input type="number" value={formBudget} onChange={(e) => setFormBudget(e.target.value)} placeholder="e.g. 20000" className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 placeholder-white/50" />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="card-base p-6 space-y-4">
        <h2 className="font-semibold">Notifications</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span>Budget exceed alert</span>
            <AnimatedCheckbox id="notify-budget" checked={!!formNotifications.budgetAlert} onChange={(e) => setFormNotifications((prev) => ({ ...prev, budgetAlert: e.target.checked }))} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Large expense alert</span>
            <AnimatedCheckbox id="notify-large" checked={!!formNotifications.largeExpense} onChange={(e) => setFormNotifications((prev) => ({ ...prev, largeExpense: e.target.checked }))} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Monthly summary email</span>
            <AnimatedCheckbox id="notify-monthly" checked={!!formNotifications.monthlyEmail} onChange={(e) => setFormNotifications((prev) => ({ ...prev, monthlyEmail: e.target.checked }))} />
          </div>
        </div>
      </section>

      {/* Account Actions */}
      <section className="card-base p-6 space-y-3">
        <h2 className="font-semibold">Account Actions</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={logout} className="px-4 py-2 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
            Logout
          </button>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--danger-red)', color: '#ffffff' }}
          >
            Delete Account
          </button>
          <button
            type="button"
            onClick={handleResetDashboard}
            disabled={resetting}
            className={`px-4 py-2 rounded-lg transition ${resetting ? 'opacity-70 pointer-events-none' : ''}`}
            style={{ background: 'linear-gradient(167deg, rgba(59,130,246,0.9), rgba(59,130,246,0.8))', color: '#fff' }}
          >
            {resetting ? 'Resetting…' : 'Reset Dashboard'}
          </button>
        </div>
      </section>

      {/* Unified Save Settings button */}
      <div
        className="sticky bottom-0 left-0 right-0 pt-4"
        style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent)' }}
      >
        <LoadingButton
          type="button"
          onClick={handleSaveSettings}
          loading={savingSettings}
          text="Save Settings"
          className="w-full px-4 py-3 rounded-xl"
        />
      </div>

      {/* Local bottom-center toast for Settings page only */}
      {localToast.show && (
        <div className="fixed inset-x-0 bottom-4 flex justify-center z-[2000] md:bottom-6">
          <div
            className={`px-4 py-2 rounded-full text-sm shadow-lg border`}
            style={{
              borderColor:
                localToast.type === 'success'
                  ? 'rgba(34,197,94,0.6)'
                  : localToast.type === 'warning'
                  ? 'rgba(234,179,8,0.6)'
                  : 'rgba(239,68,68,0.6)',
              color: 'var(--text-primary)',
              backgroundColor:
                localToast.type === 'success'
                  ? 'rgba(34,197,94,0.1)'
                  : localToast.type === 'warning'
                  ? 'rgba(234,179,8,0.1)'
                  : 'rgba(239,68,68,0.1)',
              backdropFilter: 'saturate(120%) blur(6px)'
            }}
          >
            {localToast.message}
          </div>
        </div>
      )}
    </div>
  )
}
