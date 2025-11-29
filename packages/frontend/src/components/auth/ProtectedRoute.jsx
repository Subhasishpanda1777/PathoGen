import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authAPI } from '../../utils/api'

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setIsAuthenticated(false)
        setLoading(false)
        return
      }

      try {
        await authAPI.getProfile()
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem('authToken')
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        fontWeight: 600
      }}>
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

