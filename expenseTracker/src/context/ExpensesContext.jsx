import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { apiFetch, apiBase } from "../lib/api";

export const ExpensesContext = createContext();

export function ExpensesProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const token = localStorage.getItem("token");

  // Load expenses from backend
  useEffect(() => {
    if (!token) return;
    loadExpenses();
  }, [token]);

  async function loadExpenses() {
    try {
      const res = await apiFetch(`/api/expenses/get?token=${token}`);
      const json = await res.json();

      if (json?.success) {
        setExpenses(Array.isArray(json.data) ? json.data : []);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      // console.error("Failed to load expenses:", err);
      setExpenses([]);
    }
  }

  // Add expense → backend
  async function addExpense(expense) {
    try {
      const payload = { ...expense, token };
      const res = await apiFetch(`/api/expenses/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json?.success) {
        await loadExpenses();
      }

      return json;
    } catch (err) {
      // console.error("Add expense failed:", err);
    }
  }

  // Edit expense → backend
  async function updateExpense(id, updates) {
    try {
      const payload = { id, token, ...updates };
      const res = await apiFetch(`/api/expenses/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await loadExpenses();
      return await res.json();
    } catch (err) {
      // console.error("Update failed:", err);
    }
  }

  // Delete expense → backend
  async function deleteExpense(id) {
    try {
      const res = await apiFetch(`/api/expenses/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, token }),
      });

      await loadExpenses();
      return await res.json();
    } catch (err) {
      // console.error("Delete failed:", err);
    }
  }

  const value = useMemo(
    () => ({
      expenses,
      addExpense,
      updateExpense,
      deleteExpense,
      refreshExpenses: loadExpenses,
    }),
    [expenses]
  );

  return (
    <ExpensesContext.Provider value={value}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  return useContext(ExpensesContext);
}
