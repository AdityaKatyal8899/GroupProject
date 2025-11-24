import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
      <div className="w-16 h-16 rounded-2xl grid place-items-center bg-white/10">
        <AlertTriangle size={28} />
      </div>
      <h1 className="h1-heading text-3xl font-bold">Page Not Found</h1>
      <p className="max-w-md" style={{ color: 'var(--text-secondary)' }}>
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-primary-light"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
