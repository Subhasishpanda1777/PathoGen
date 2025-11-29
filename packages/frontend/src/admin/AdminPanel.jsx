import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { CheckCircle, XCircle, AlertCircle, Shield, Lock, Eye, Image as ImageIcon } from 'lucide-react'
import { symptomsAPI, authAPI } from '../utils/api'
import FilePreviewModal from '../components/FilePreviewModal'
import '../admin/styles/admin-panel.css'

export default function AdminPanel() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [previewFile, setPreviewFile] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all') // all, pending, verified, rejected

  // Verify admin access on mount
  useEffect(() => {
    verifyAdminAccess()
  }, [])

  const verifyAdminAccess = async () => {
    try {
      const response = await authAPI.getProfile()
      const userData = response.data.user || response.data
      setUser(userData)
      
      // Check if user is admin
      if (userData.role !== 'admin') {
        setError('Unauthorized: Admin access required')
        setLoading(false)
        setCheckingAuth(false)
        return
      }
      
      // User is admin, proceed to load reports
      setCheckingAuth(false)
      loadReports()
      
      if (containerRef.current) {
        gsap.from(containerRef.current.querySelectorAll('.report-item'), {
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
      setCheckingAuth(false)
      if (err.response?.status === 401 || err.response?.status === 403) {
        setTimeout(() => navigate('/admin/login'), 2000)
      }
    }
  }

  const loadReports = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await symptomsAPI.getReports()
      setReports(response.data.reports || [])
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load reports.'
      setError(errorMessage)
      
      // If unauthorized or forbidden, redirect to admin login
      if (err.response?.status === 401 || err.response?.status === 403) {
        setTimeout(() => navigate('/admin/login'), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await symptomsAPI.verifyReport(id, { status })
      loadReports()
    } catch (err) {
      setError('Failed to update report status. Please try again.')
    }
  }

  const handlePreview = (report) => {
    if (report.imageUrl) {
      const isImage = report.imageUrl.startsWith('data:image/')
      const isPDF = report.imageUrl.startsWith('data:application/pdf')
      setPreviewFile({
        fileUrl: report.imageUrl,
        fileName: `Report-${report.id.substring(0, 8)}`,
        fileType: isImage ? 'image' : isPDF ? 'pdf' : 'file'
      })
    }
  }

  // Filter reports by status
  const filteredReports = filterStatus === 'all' 
    ? reports 
    : reports.filter(r => r.status === filterStatus)

  // Show unauthorized message if not admin
  if (checkingAuth) {
    return (
      <div className="admin-panel-page">
        <main className="admin-panel-main">
          <div className="container">
            <div className="loading-state">Verifying admin access...</div>
          </div>
        </main>
      </div>
    )
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="admin-panel-page">
        <main className="admin-panel-main">
          <div className="container">
            <div className="unauthorized-state">
              <Lock size={64} className="unauthorized-icon" />
              <h1>Access Denied</h1>
              <p>You do not have permission to access the admin panel.</p>
              <p className="unauthorized-subtitle">Admin privileges are required to view and manage reports.</p>
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
    <div className="admin-panel-page" ref={containerRef}>
      <main className="admin-panel-main">
        <div className="container">
          <div className="admin-panel-header">
            <Shield size={48} className="admin-panel-icon" />
            <h1>Admin Panel - Symptom Reports</h1>
            <p>Review and verify citizen symptom reports</p>
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

          {/* Status Filter */}
          {!loading && reports.length > 0 && (
            <div className="admin-filter-section">
              <div className="filter-buttons">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                >
                  All ({reports.length})
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                >
                  Pending ({reports.filter(r => r.status === 'pending').length})
                </button>
                <button
                  onClick={() => setFilterStatus('verified')}
                  className={`filter-btn ${filterStatus === 'verified' ? 'active' : ''}`}
                >
                  Verified ({reports.filter(r => r.status === 'verified').length})
                </button>
                <button
                  onClick={() => setFilterStatus('rejected')}
                  className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
                >
                  Rejected ({reports.filter(r => r.status === 'rejected').length})
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="loading-state">Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="empty-state">
              <Shield size={64} />
              <h3>No reports found</h3>
              <p>
                {filterStatus === 'all' 
                  ? 'There are no reports to review.' 
                  : `There are no ${filterStatus} reports.`}
              </p>
            </div>
          ) : (
            <div className="reports-list">
              {filteredReports.map((report) => (
                <div key={report.id} className="report-item admin-card">
                  <div className="report-header">
                    <div>
                      <h3>Report #{report.id.substring(0, 8)}</h3>
                      <p className="report-date">
                        {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {report.status === 'verified' ? (
                      <div className="status-badge status-verified">
                        <CheckCircle size={18} />
                        Verified
                      </div>
                    ) : report.status === 'rejected' ? (
                      <div className="status-badge status-rejected">
                        <XCircle size={18} />
                        Rejected
                      </div>
                    ) : (
                      <div className="status-badge status-pending">
                        <AlertCircle size={18} />
                        Pending
                      </div>
                    )}
                  </div>

                  <div className="report-details">
                    {report.user && (
                      <div className="detail-group">
                        <strong>Reported By:</strong>
                        <div className="user-info">
                          <span>{report.user.name || 'Unknown'}</span>
                          <span className="user-email">{report.user.email}</span>
                        </div>
                      </div>
                    )}
                    {!report.user && report.email && (
                      <div className="detail-group">
                        <strong>Reported By:</strong>
                        <span className="user-email">{report.email}</span>
                      </div>
                    )}
                    
                    <div className="detail-group">
                      <strong>Symptoms:</strong>
                      <div className="symptoms-list">
                        {report.symptoms?.map((symptom, idx) => (
                          <span key={idx} className="symptom-tag">{symptom}</span>
                        ))}
                      </div>
                    </div>

                    <div className="detail-group">
                      <strong>Duration:</strong> {report.duration} day{report.duration !== 1 ? 's' : ''}
                    </div>

                    <div className="detail-group">
                      <strong>Severity:</strong> <span className={`severity-${report.severity?.toLowerCase()}`}>{report.severity}</span>
                    </div>

                    <div className="detail-group">
                      <strong>Location:</strong> {report.location?.state}, {report.location?.district}, {report.location?.city}
                    </div>

                    {report.description && (
                      <div className="detail-group">
                        <strong>Additional Details:</strong>
                        <p>{report.description}</p>
                      </div>
                    )}

                    {report.imageUrl && (
                      <div className="detail-group">
                        <strong>Attached File:</strong>
                        <button
                          onClick={() => handlePreview(report)}
                          className="btn-file-preview"
                        >
                          <ImageIcon size={16} />
                          <span>Preview File</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {report.status === 'pending' && (
                    <div className="report-actions">
                      <button
                        onClick={() => handleStatusChange(report.id, 'verified')}
                        className="btn btn-primary"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(report.id, 'rejected')}
                        className="btn btn-reject"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          fileUrl={previewFile.fileUrl}
          fileName={previewFile.fileName}
          fileType={previewFile.fileType}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  )
}

