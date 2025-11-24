import { Plus } from 'lucide-react'
import PurpleDropdown from '../components/ui/PurpleDropdown'
import { useExpenses } from '../context/ExpensesContext'
import { useSavings } from '../context/SavingsContext'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { calculateTotalSavings } from '../lib/financeUtils'
import { useToast } from '../components/common/toast/ToastProvider'
import LoadingButton from '../components/common/LoadingButton'
import { apiFetch } from '../lib/api'

const categories = ['Food','Transport','Bills','Shopping','Entertainment','Health','Other']

export default function Expenses() {
  const { expenses, addExpense: addExpenseLocalState, deleteExpense, editExpense, recoverExpense, payExpenseFromSavings } = useExpenses()
  const { savings, addSaving, addSavingFromRecovery, spendFromSavings } = useSavings()
  const [open, setOpen] = useState(false)
  const [openSavings, setOpenSavings] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const TOKEN = 'test_user_123'

  // Loading states for buttons
  const [savingExpense, setSavingExpense] = useState(false)
  const [savingSavings, setSavingSavings] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [savingRecover, setSavingRecover] = useState(false)

  useEffect(() => {
    if (searchParams.get('add') === '1') setOpen(true)
  }, [searchParams])

  function closeModal() {
    setOpen(false)
    // remove query param
    if (searchParams.get('add')) {
      searchParams.delete('add')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const [form, setForm] = useState({ name: '', amount: '', category: 'Other', date: '', notes: '' })
  const [errors, setErrors] = useState({})

  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', amount: '', category: 'Other', date: '', notes: '' })
  const [editErrors, setEditErrors] = useState({})
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryAmount, setRecoveryAmount] = useState('')
  // Filters
  const [filterCategory, setFilterCategory] = useState('All Categories')
  const [filterDate, setFilterDate] = useState('Today')
  const [filterSort, setFilterSort] = useState('Recent')

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.amount || isNaN(Number(form.amount))) e.amount = 'Valid amount required'
    if (!form.category) e.category = 'Required'
    if (!form.date) e.date = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSave(e) {
    e.preventDefault()
    if (!validate() || savingExpense) return
    const expense = {
      category: form.category,
      amount: Number(form.amount),
      description: (form.notes || form.name || '').toString(),
      date: form.date,
    }
    setSavingExpense(true)
    const ok = await addExpense(expense)
    setSavingExpense(false)
    if (ok) {
      setForm({ name: '', amount: '', category: 'Other', date: '', notes: '' })
      closeModal()
    }
  }

  // EXACT function as requested for API call
  const addExpense = async (expense) => {
    try {
      const response = await apiFetch('/api/expenses/add', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
      })
      const data = await response.json()
      console.log(data)

      if (data.success) {
        showToast('success', 'Expense added successfully')
        // Optionally reflect in local state if context is used
        try {
          addExpenseLocalState({
            name: form.name.trim(),
            category: expense.category,
            amount: expense.amount,
            date: expense.date,
            notes: form.notes?.trim() || '',
          })
        } catch {}
        return true
      } else {
        showToast('error', 'Failed: ' + data.message)
        return false
      }
    } catch (err) {
      console.error("Error adding expense:", err)
      showToast('error', 'Server error')
      return false
    }
  }

  // Submit handler that maps current form state to API
  const handleSubmit = (e) => {
    e.preventDefault()
    const expense = {
      category: form.category,
      amount: Number(form.amount),
      description: (form.notes || form.name || '').toString(),
      date: form.date,
    }
    addExpense(expense)
  }

  // Internal helper used by onSave path
  function handleSubmitDirect(expense) {
    return addExpense(expense)
  }

  const rows = useMemo(
    () => (expenses || []).filter((e) => !e.type || e.type === 'expense'),
    [expenses],
  )

  function openEdit(expense) {
    setEditId(expense.id)
    setEditForm({
      name: expense.name || '',
      category: expense.category || 'Other',
      amount: String(expense.amount ?? ''),
      date: expense.date || '',
      notes: expense.notes || '',
    })
    setEditErrors({})
    setShowRecovery(false)
    setRecoveryAmount('')
  }

  function validateEdit() {
    const e = {}
    if (!editForm.name.trim()) e.name = 'Required'
    if (!editForm.amount || isNaN(Number(editForm.amount))) e.amount = 'Valid amount required'
    if (!editForm.category) e.category = 'Required'
    if (!editForm.date) e.date = 'Required'
    setEditErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSaveEdit(e) {
    e.preventDefault()
    if (!validateEdit() || !editId || savingEdit) return
    setSavingEdit(true)
    try {
      await Promise.resolve(
        editExpense(editId, {
          name: editForm.name.trim(),
          category: editForm.category,
          amount: Number(editForm.amount),
          date: editForm.date,
          notes: editForm.notes?.trim() || '',
        })
      )
      setEditId(null)
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Heading + Add button */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="h1-heading text-xl font-bold">Expenses</h1>
        <div className="expense-actions flex md:block justify-center gap-2 md:gap-0">
          <button
            onClick={() => {
              setOpenSavings(true)
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full border transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-primary/20"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}
          >
            <Plus size={16} />
            Add to Savings
          </button>
          <button
            onClick={() => {
              setOpen(true)
              navigate('/expenses?add=1', { replace: false })
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full primary-button transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="card-base p-4">
        <div className="space-y-3 filters-container">
          <input type="text" placeholder="Search expenses..." className="rounded-lg px-3 py-2 w-full filter-input" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 lg:gap-6">
            <PurpleDropdown
              className="compact full custom-dropdown"
              options={["All Categories", ...categories]}
              value={filterCategory}
              onChange={setFilterCategory}
            />
            <PurpleDropdown
              className="compact full custom-dropdown"
              options={["Today","This Week","This Month","This Year"]}
              value={filterDate}
              onChange={setFilterDate}
            />
            <PurpleDropdown
              className="compact full custom-dropdown"
              options={["Recent","Oldest","High Amount","Low Amount"]}
              value={filterSort}
              onChange={setFilterSort}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-base p-0">
        <div
          className="px-6 py-4 border-b text-sm"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
        >
          Expenses
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {rows.length === 0 && (
                <tr>
                  <td className="px-6 py-6" style={{ color: 'var(--text-secondary)' }} colSpan={5}>
                    No expenses yet. Click "Add Expense" to create one.
                  </td>
                </tr>
              )}
              {rows.map((e) => (
                <tr key={e.id} className="border-b border-white/5 last:border-b-0">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span>{e.name}</span>
                      {e.paidFromSavings && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: 'rgb(22,163,74)' }}>
                          Recovered
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3">{e.category || '—'}</td>
                  <td className="px-6 py-3">${Number(e.amount).toFixed(2)}</td>
                  <td className="px-6 py-3">{e.date}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3 text-xs text-white/70">
                      <button className="hover:text-white" onClick={() => openEdit(e)}>Edit</button>
                      <span className="opacity-30">|</span>
                      <button className="hover:text-white" onClick={() => deleteExpense(e.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <form onSubmit={onSave} className="card-base p-6 w-full max-w-md space-y-4">
              <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Add Expense
              </div>
              <div className="space-y-1">
                <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                />
                {errors.name && <div className="text-red-400 text-xs">{errors.name}</div>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                  />
                  {errors.amount && <div className="text-red-400 text-xs">{errors.amount}</div>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>Category</label>
                  <PurpleDropdown
                    options={categories}
                    value={form.category}
                    onChange={(val) => setForm({ ...form, category: val })}
                  />
                  {errors.category && <div className="text-red-400 text-xs">{errors.category}</div>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                  />
                  {errors.date && <div className="text-red-400 text-xs">{errors.date}</div>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>Notes (optional)</label>
                  <input
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-full border"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}
                >
                  Cancel
                </button>
                <LoadingButton type="submit" loading={savingExpense} text="Save" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editId && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditId(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <form onSubmit={onSaveEdit} className="card-base p-6 w-full max-w-md space-y-4">
              <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Edit Expense
              </div>
              <div className="space-y-1">
                <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Name
                </label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                />
                {editErrors.name && <div className="text-red-400 text-xs">{editErrors.name}</div>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                  />
                  {editErrors.amount && <div className="text-red-400 text-xs">{editErrors.amount}</div>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Category
                  </label>
                  <PurpleDropdown
                    options={categories}
                    value={editForm.category}
                    onChange={(val) => setEditForm({ ...editForm, category: val })}
                  />
                  {editErrors.category && <div className="text-red-400 text-xs">{editErrors.category}</div>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                  />
                  {editErrors.date && <div className="text-red-400 text-xs">{editErrors.date}</div>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Notes
                  </label>
                  <input
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              {showRecovery && (
                <div className="space-y-1 border-t pt-3 mt-1" style={{ borderColor: 'var(--border-color)' }}>
                  <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Recover amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={recoveryAmount}
                    onChange={(e) => setRecoveryAmount(e.target.value)}
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                    placeholder="e.g. part of this expense"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg text-xs border"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}
                      onClick={() => setShowRecovery(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg text-xs primary-button"
                      onClick={() => {
                        const amt = Number(recoveryAmount) || 0
                        const current = Number(editForm.amount) || 0
                        if (!amt || amt <= 0 || amt > current) return
                        recoverExpense(editId, amt)
                        addSavingFromRecovery(amt)
                        setEditId(null)
                      }}
                    >
                      Confirm Recovery
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditId(null)}
                  className="px-4 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}
                >
                  Close
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg text-xs border"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}
                    onClick={() => {
                      const totalSavings = calculateTotalSavings(savings)
                      const amt = Number(editForm.amount) || 0
                      if (!amt || totalSavings < amt) return
                      if (savingRecover) return
                      setSavingRecover(true)
                      apiFetch('/api/savings/use', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          token: TOKEN,
                          amount: amt,
                          category: editForm.category,
                          description: (editForm.notes || editForm.name || '').toString(),
                        }),
                      })
                        .then(async (res) => {
                          let data = null
                          try { data = await res.json() } catch {}
                          if (!res.ok || !data?.success) {
                            throw new Error((data && (data.message || data.error)) || 'Unable to recover using savings')
                          }
                          // Local state updates for immediate UI change
                          payExpenseFromSavings(editId)
                          spendFromSavings(amt)
                          showToast('success', 'Recovered from savings')
                          setEditId(null)
                        })
                        .catch((e) => {
                          console.error('Savings recovery error', e)
                          showToast('error', 'Unable to recover using savings')
                        })
                        .finally(() => setSavingRecover(false))
                    }}
                  >
                    {savingRecover ? 'Processing…' : 'Pay from Savings'}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15 text-xs"
                    onClick={() => setShowRecovery(true)}
                  >
                    Recover Money
                  </button>
                  <LoadingButton type="submit" loading={savingEdit} text="Save Changes" className="px-4 py-2 rounded-lg" />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add to Savings Modal */}
      {openSavings && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenSavings(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (savingSavings) return
                if (!form.amount || isNaN(Number(form.amount))) {
                  setErrors((prev) => ({
                    ...prev,
                    amount: 'Valid amount required',
                  }))
                  return
                }
                // Call backend Savings API
                setSavingSavings(true)
                apiFetch('/api/savings/add', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token: TOKEN, amount: Number(form.amount), note: form.notes?.trim() || '' }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data?.success) {
                      showToast('success', 'Added to savings')
                      // reflect locally for immediate UI feedback
                      addSaving({ amount: Number(form.amount), date: form.date || new Date().toISOString().slice(0, 10), note: form.notes?.trim() || '' })
                      setForm({ name: '', amount: '', category: 'Other', date: '', notes: '' })
                      setOpenSavings(false)
                    } else {
                      showToast('error', data?.message || 'Failed to add to savings')
                    }
                  })
                  .catch((err) => {
                    console.error('Savings add error', err)
                    showToast('error', 'Server error')
                  })
                  .finally(() => setSavingSavings(false))
              }}
              className="card-base p-6 w-full max-w-md space-y-4"
            >
              <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Add to Savings
              </div>
              <div className="space-y-1">
                <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                  placeholder="e.g. 5000"
                />
                {errors.amount && <div className="text-red-400 text-xs">{errors.amount}</div>}
              </div>
              <div className="space-y-1">
                <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Notes (optional)
                </label>
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                  placeholder="e.g. Emergency fund"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenSavings(false)}
                  className="px-4 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}
                >
                  Cancel
                </button>
                <LoadingButton type="submit" loading={savingSavings} text="Save" className="px-4 py-2 rounded-lg" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
