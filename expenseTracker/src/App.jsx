import { ThemeProvider } from './context/ThemeContext'
import { SidebarProvider } from './context/SidebarContext'
import AppRouter from './router/AppRouter'
import { ExpensesProvider } from './context/ExpensesContext'
import { FinanceProvider } from './context/FinanceContext'
import { SavingsProvider } from './context/SavingsContext'
import { ToastProvider } from './components/common/toast/ToastProvider'

export default function App() {
  return (
    <ExpensesProvider>
      <SavingsProvider>
        <FinanceProvider>
          <ThemeProvider>
            <SidebarProvider>
              <ToastProvider>
                <AppRouter />
              </ToastProvider>
            </SidebarProvider>
          </ThemeProvider>
        </FinanceProvider>
      </SavingsProvider>
    </ExpensesProvider>
  )
}
