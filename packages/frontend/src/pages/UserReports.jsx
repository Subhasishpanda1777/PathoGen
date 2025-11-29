import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { CheckCircle, XCircle, AlertCircle, FileText, Calendar, MapPin, Eye, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import { symptomsAPI } from '../utils/api'
import FilePreviewModal from '../components/FilePreviewModal'
import '../styles/user-reports.css'

export default function UserReports() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)
  const [editingReport, setEditingReport] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadReports()
    
    if (containerRef.current) {
      gsap.from(containerRef.current.querySelectorAll('.report-card'), {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      })
    }
  }, [])

  const loadReports = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await symptomsAPI.getMyReports()
      setReports(response.data.reports || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports.')
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <div className="status-badge status-verified">
            <CheckCircle size={16} />
            <span>Approved</span>
          </div>
        )
      case 'rejected':
        return (
          <div className="status-badge status-rejected">
            <XCircle size={16} />
            <span>Rejected</span>
          </div>
        )
      default:
        return (
          <div className="status-badge status-pending">
            <AlertCircle size={16} />
            <span>Pending</span>
          </div>
        )
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'mild':
        return 'severity-mild'
      case 'moderate':
        return 'severity-moderate'
      case 'severe':
        return 'severity-severe'
      default:
        return ''
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

  const handleEdit = (report) => {
    if (report.status === 'pending') {
      navigate(`/report?edit=${report.id}`)
    } else {
      setError('Can only edit pending reports')
    }
  }

  const handleDelete = async (reportId) => {
    try {
      await symptomsAPI.deleteReport(reportId)
      setReports(reports.filter(r => r.id !== reportId))
      setDeleteConfirm(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete report')
    }
  }

  const getFileType = (imageUrl) => {
    if (!imageUrl) return null
    if (imageUrl.startsWith('data:image/')) return 'image'
    if (imageUrl.startsWith('data:application/pdf')) return 'pdf'
    return 'file'
  }

  return (
    <div className="user-reports-page" ref={containerRef}>
      <main className="user-reports-main">
        <div className="container">
          <div className="user-reports-header">
            <FileText size={48} className="reports-icon" />
            <h1>My Symptom Reports</h1>
            <p>View your submitted symptom reports and their status</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="loading-state">Loading your reports...</div>
          ) : reports.length === 0 ? (
            <div className="empty-state">
              <FileText size={64} />
              <h3>No reports found</h3>
              <p>You haven't submitted any symptom reports yet.</p>
              <button onClick={() => navigate('/report')} className="btn btn-primary">
                Submit Your First Report
              </button>
            </div>
          ) : (
            <div className="reports-grid">
              {reports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-card-header">
                    <div className="report-id">
                      <FileText size={18} />
                      <span>Report #{report.id.substring(0, 8)}</span>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="report-card-body">
                    <div className="report-section">
                      <strong>Symptoms:</strong>
                      <div className="symptoms-list">
                        {report.symptoms?.slice(0, 3).map((symptom, idx) => (
                          <span key={idx} className="symptom-tag">{symptom}</span>
                        ))}
                        {report.symptoms?.length > 3 && (
                          <span className="symptom-tag-more">+{report.symptoms.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    <div className="report-details-grid">
                      <div className="report-detail">
                        <Calendar size={16} />
                        <div>
                          <span className="detail-label">Duration</span>
                          <span className="detail-value">{report.duration} day{report.duration !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="report-detail">
                        <AlertCircle size={16} />
                        <div>
                          <span className="detail-label">Severity</span>
                          <span className={`detail-value ${getSeverityColor(report.severity)}`}>
                            {report.severity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {report.location && (
                      <div className="report-section">
                        <MapPin size={16} />
                        <span className="location-text">
                          {[report.location.state, report.location.district, report.location.city]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}

                    <div className="report-date">
                      <Calendar size={14} />
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>

                    {report.imageUrl && (
                      <div className="report-file-indicator">
                        <ImageIcon size={16} />
                        <span>File attached</span>
                      </div>
                    )}
                  </div>

                  <div className="report-card-actions">
                    {report.imageUrl && (
                      <button
                        onClick={() => handlePreview(report)}
                        className="btn-action btn-preview"
                        title="Preview file"
                      >
                        <Eye size={16} />
                        <span>Preview</span>
                      </button>
                    )}
                    {report.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleEdit(report)}
                          className="btn-action btn-edit"
                          title="Edit report"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(report.id)}
                          className="btn-action btn-delete"
                          title="Delete report"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="delete-confirm-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Report?</h3>
            <p>Are you sure you want to delete this report? This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

