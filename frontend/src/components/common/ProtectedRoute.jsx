/**
 * COMPONENT: ProtectedRoute
 * Purpose: Wraps routes that require authentication.
 * Behavior:
 *  - If user is authenticated → render <Outlet />
 *  - If not authenticated → redirect to /login
 *  - Shows loading spinner while auth state is being resolved
 */
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = () => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
export default ProtectedRoute
