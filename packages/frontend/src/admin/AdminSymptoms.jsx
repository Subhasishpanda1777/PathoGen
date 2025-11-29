import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { Activity, Plus, Edit, Trash2, AlertCircle, CheckCircle, X } from 'lucide-react'
import { authAPI, adminAPI } from '../utils/api'
import '../admin/styles/admin-symptoms.css'

export default function AdminSymptoms() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [symptoms, setSymptoms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSymptom, setEditingSymptom] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    isActive: true,
  })

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
      
      loadSymptoms()
    } catch (err) {
      console.error('Admin access verification failed:', err)
      setError('Failed to verify admin access. Please login again.')
      setLoading(false)
      if (err.response?.status === 401 || err.response?.status === 403) {
        setTimeout(() => navigate('/admin/login'), 2000)
      }
    }
  }

  const loadSymptoms = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await adminAPI.getSymptoms()
      setSymptoms(response.data.symptoms || [])
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load symptoms.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      if (editingSymptom) {
        await adminAPI.updateSymptom(editingSymptom.id, formData)
      } else {
        await adminAPI.createSymptom(formData)
      }
      
      setShowAddForm(false)
      setEditingSymptom(null)
      resetForm()
      loadSymptoms()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save symptom.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this symptom?')) return

    try {
      await adminAPI.deleteSymptom(id)
      loadSymptoms()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete symptom.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      isActive: true,
    })
  }

  const startEdit = (symptom) => {
    setEditingSymptom(symptom)
    setFormData({
      name: symptom.name || '',
      category: symptom.category || '',
      description: symptom.description || '',
      isActive: symptom.isActive !== false,
    })
    setShowAddForm(true)
  }

  if (loading) {
    return (
      <div className="admin-symptoms-page">
        <main className="admin-symptoms-main">
          <div className="container">
            <div className="loading-state">Loading symptoms...</div>
          </div>
        </main>
      </div>
    )
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="admin-symptoms-page">
        <main className="admin-symptoms-main">
          <div className="container">
            <div className="unauthorized-state">
              <AlertCircle size={64} />
              <h1>Access Denied</h1>
              <p>You do not have permission to access this page.</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-symptoms-page" ref={containerRef}>
      <main className="admin-symptoms-main">
        <div className="container">
          <div className="admin-symptoms-header">
            <Activity size={48} className="admin-symptoms-icon" />
            <h1>Manage Symptoms</h1>
            <p>Add and manage symptoms that users can select when reporting</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="admin-symptoms-actions">
            <button
              onClick={() => {
                resetForm()
                setEditingSymptom(null)
                setShowAddForm(!showAddForm)
              }}
              className="btn btn-primary"
            >
              <Plus size={18} />
              <span>{showAddForm ? 'Cancel' : 'Add Symptom'}</span>
            </button>
          </div>

          {showAddForm && (
            <div className="symptom-form-card">
              <h3>{editingSymptom ? 'Edit Symptom' : 'Add New Symptom'}</h3>
              <form onSubmit={handleSubmit} className="symptom-form">
                <div className="form-group">
                  <label>Symptom Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Fever, Cough, Headache"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Respiratory, Digestive, Neurological"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Optional description of the symptom"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    Active (visible to users)
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <CheckCircle size={18} />
                    {editingSymptom ? 'Update Symptom' : 'Add Symptom'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingSymptom(null)
                      resetForm()
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="symptoms-list">
            {symptoms.length === 0 ? (
              <div className="empty-state">
                <Activity size={64} />
                <h3>No symptoms found</h3>
                <p>Add your first symptom to get started</p>
              </div>
            ) : (
              <div className="symptoms-grid">
                {symptoms.map((symptom) => (
                  <div key={symptom.id} className="symptom-card">
                    <div className="symptom-header">
                      <h3>{symptom.name}</h3>
                      <div className="symptom-actions">
                        <button
                          onClick={() => startEdit(symptom)}
                          className="btn-icon"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(symptom.id)}
                          className="btn-icon btn-danger"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    {symptom.category && (
                      <span className="symptom-category">{symptom.category}</span>
                    )}
                    {symptom.description && (
                      <p className="symptom-description">{symptom.description}</p>
                    )}
                    <div className="symptom-status">
                      <span className={`status-badge ${symptom.isActive ? 'active' : 'inactive'}`}>
                        {symptom.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

