import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

type ProtectedRouteProps = {
  children: React.ReactNode
  requiredRole?: 'user' | 'kasir' | 'admin'
}

export const ProtectedRoute = ({ children, requiredRole = 'user' }: ProtectedRouteProps) => {
  const location = useLocation()
  const { loading, profile } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const roleCheck = {
    user: ['user', 'kasir', 'admin'],
    kasir: ['kasir', 'admin'],
    admin: ['admin'],
  }

  if (!roleCheck[requiredRole].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}