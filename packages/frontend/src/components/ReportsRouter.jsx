import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminReports from '../pages/AdminReports'
import UserReports from '../pages/UserReports'
import { authAPI } from '../utils/api'

export default function ReportsRouter() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      setUser(response.data.user || response.data)
    } catch (error) {
      console.error('Failed to load profile:', error)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

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

  // Show admin reports if user is admin, otherwise show user reports
  if (user?.role === 'admin') {
    return <AdminReports />
  }

  // Regular users see their own reports
  return <UserReports />
}

