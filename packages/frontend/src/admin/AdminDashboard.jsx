import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { Shield, Users, FileText, CheckCircle, XCircle, AlertCircle, TrendingUp, Pill, Activity } from 'lucide-react'
import { authAPI, symptomsAPI } from '../utils/api'
import '../admin/styles/admin-dashboard.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    verifiedReports: 0,
    rejectedReports: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    verifyAdminAccess()
  }, [])

  const verifyAdminAccess = async () => {
    try {
      const response = await authAPI.getProfile()
      const userData = response.data.user || response.data
      setUser(userData)
      
      if (userData.role !== 'admin') {
        setError('Unauthorized: Admin access required')
        setLoading(false)
        return
      }
      
      loadStats()
      
      if (containerRef.current) {
        gsap.from(containerRef.current.querySelectorAll('.stat-card'), {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
        })
      }
    } catch (err) {
      console.error('Admin access verification failed:', err)
      setError('Failed to verify admin access. Please login again.')
      setLoading(false)
      if (err.response?.status === 401 || err.response?.status === 403) {
        setTimeout(() => navigate('/admin/login'), 2000)
      }
    }
  }

  const loadStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await symptomsAPI.getReports()
      const reports = response.data.reports || []
      
      setStats({
        totalReports: reports.length,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        verifiedReports: reports.filter(r => r.status === 'verified').length,
        rejectedReports: reports.filter(r => r.status === 'rejected').length,
      })
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load statistics.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <main className="admin-dashboard-main">
          <div className="container">
            <div className="loading-state">Loading dashboard...</div>
          </div>
        </main>
      </div>
    )
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="admin-dashboard-page">
        <main className="admin-dashboard-main">
          <div className="container">
            <div className="unauthorized-state">
              <Shield size={64} className="unauthorized-icon" />
              <h1>Access Denied</h1>
              <p>You do not have permission to access the admin dashboard.</p>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                Go to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-dashboard-page" ref={containerRef}>
      <main className="admin-dashboard-main">
        <div className="container">
          <div className="admin-dashboard-header">
            <Shield size={48} className="admin-dashboard-icon" />
            <h1>Admin Dashboard</h1>
            <p>Overview of system statistics and reports</p>
            {user && (
              <p className="admin-user-info">Logged in as: <strong>{user.name || user.email}</strong></p>
            )}
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card stat-total">
              <div className="stat-icon">
                <FileText size={32} />
              </div>
              <div className="stat-content">
                <h3>Total Reports</h3>
                <p className="stat-value">{stats.totalReports}</p>
              </div>
            </div>

            <div className="stat-card stat-pending">
              <div className="stat-icon">
                <AlertCircle size={32} />
              </div>
              <div className="stat-content">
                <h3>Pending</h3>
                <p className="stat-value">{stats.pendingReports}</p>
              </div>
            </div>

            <div className="stat-card stat-verified">
              <div className="stat-icon">
                <CheckCircle size={32} />
              </div>
              <div className="stat-content">
                <h3>Verified</h3>
                <p className="stat-value">{stats.verifiedReports}</p>
              </div>
            </div>

            <div className="stat-card stat-rejected">
              <div className="stat-icon">
                <XCircle size={32} />
              </div>
              <div className="stat-content">
                <h3>Rejected</h3>
                <p className="stat-value">{stats.rejectedReports}</p>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button
                onClick={() => navigate('/admin/reports')}
                className="action-card"
              >
                <FileText size={24} />
                <span>View All Reports</span>
              </button>
              <button
                onClick={() => navigate('/admin/reports?status=pending')}
                className="action-card"
              >
                <AlertCircle size={24} />
                <span>Review Pending</span>
              </button>
              <button
                onClick={() => navigate('/admin/medicines')}
                className="action-card"
              >
                <Pill size={24} />
                <span>Manage Medicines</span>
              </button>
              <button
                onClick={() => navigate('/admin/symptoms')}
                className="action-card"
              >
                <Activity size={24} />
                <span>Manage Symptoms</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

