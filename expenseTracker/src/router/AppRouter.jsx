import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Dashboard from '../pages/Dashboard'
import Expenses from '../pages/Expenses'
import Reports from '../pages/Reports'
import Settings from '../pages/Settings'
import Profile from '../pages/Profile'
import NotFound from '../pages/NotFound'
import Login from '../pages/Login'
import LoginSuccess from '../pages/LoginSuccess'

function RequireAuth({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login/success" element={<LoginSuccess />} />
        <Route path="/" element={<Layout />}> 
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="expenses" element={<RequireAuth><Expenses /></RequireAuth>} />
          <Route path="reports" element={<RequireAuth><Reports /></RequireAuth>} />
          <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
