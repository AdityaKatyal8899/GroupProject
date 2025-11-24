import Header from './Header'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'
import MobileBottomBar from '../navigation/MobileBottomBar'

export default function Layout() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <Header />
      <Sidebar />
      <main className="pt-[132px] md:pt-24 pl-0 md:pl-[72px] pb-[110px] md:pb-6">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
      <MobileBottomBar />
    </div>
  )
}
