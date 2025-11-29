import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { Pill, Plus, Edit, Trash2, MapPin, DollarSign, AlertCircle, CheckCircle, X } from 'lucide-react'
import { authAPI, adminAPI } from '../utils/api'
import '../admin/styles/admin-medicines.css'

export default function AdminMedicines() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [showPriceForm, setShowPriceForm] = useState(null)
  const [editingPrice, setEditingPrice] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    genericName: '',
    brandName: '',
    manufacturer: '',
    composition: [{ ingredient: '', dosage: '' }],
    form: '',
    strength: '',
    packaging: '',
    indications: '',
    category: '',
    schedule: '',
    isPrescriptionRequired: false,
    source: 'Manual',
    sourceUrl: '',
  })

  const [priceFormData, setPriceFormData] = useState({
    source: 'Janaushadhi',
    price: '',
    currency: 'INR',
    packaging: '',
    availability: 'available',
    location: { state: '', city: '', district: '' },
    sourceUrl: '',
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
      
      loadMedicines()
    } catch (err) {
      console.error('Admin access verification failed:', err)
      setError('Failed to verify admin access. Please login again.')
      setLoading(false)
      if (err.response?.status === 401 || err.response?.status === 403) {
        setTimeout(() => navigate('/admin/login'), 2000)
      }
    }
  }

  const loadMedicines = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await adminAPI.getMedicines()
      const medicinesList = response.data?.medicines || response.data || []
      setMedicines(Array.isArray(medicinesList) ? medicinesList : [])
      
      // If no medicines found, show a helpful message
      if (medicinesList.length === 0) {
        setError('No medicines found. Start by adding your first medicine.')
      }
    } catch (err) {
      console.error('Error loading medicines:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to load medicines. Please check if the medicines table exists in the database.'
      setError(errorMessage)
      
      // If it's a database error, show more details
      if (err.response?.data?.details) {
        console.error('Database error details:', err.response.data.details)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      if (editingMedicine) {
        await adminAPI.updateMedicine(editingMedicine.id, formData)
      } else {
        await adminAPI.createMedicine(formData)
      }
      
      setShowAddForm(false)
      setEditingMedicine(null)
      resetForm()
      loadMedicines()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medicine.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return

    try {
      await adminAPI.deleteMedicine(id)
      loadMedicines()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete medicine.')
    }
  }

  const handleAddPrice = async (medicineId, e) => {
    e.preventDefault()
    setError(null)

    try {
      if (editingPrice) {
        await adminAPI.updateMedicinePrice(medicineId, editingPrice.id, {
          ...priceFormData,
          price: parseFloat(priceFormData.price),
        })
      } else {
        await adminAPI.addMedicinePrice(medicineId, {
          ...priceFormData,
          price: parseFloat(priceFormData.price),
        })
      }
      setShowPriceForm(null)
      setEditingPrice(null)
      resetPriceForm()
      loadMedicines()
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editingPrice ? 'update' : 'add'} price.`)
    }
  }

  const handleDeletePrice = async (medicineId, priceId) => {
    if (!window.confirm('Are you sure you want to delete this price?')) return

    try {
      await adminAPI.deleteMedicinePrice(medicineId, priceId)
      loadMedicines()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete price.')
    }
  }

  const startEditPrice = (medicineId, price) => {
    setEditingPrice(price)
    setPriceFormData({
      source: price.source || 'Janaushadhi',
      price: price.price || '',
      currency: price.currency || 'INR',
      packaging: price.packaging || '',
      availability: price.availability || 'available',
      location: price.location || { state: '', city: '', district: '' },
      sourceUrl: price.sourceUrl || '',
    })
    setShowPriceForm(medicineId)
  }

  const cancelPriceEdit = () => {
    setShowPriceForm(null)
    setEditingPrice(null)
    resetPriceForm()
  }

  const resetForm = () => {
    setFormData({
      genericName: '',
      brandName: '',
      manufacturer: '',
      composition: [{ ingredient: '', dosage: '' }],
      form: '',
      strength: '',
      packaging: '',
      indications: '',
      category: '',
      schedule: '',
      isPrescriptionRequired: false,
      source: 'Manual',
      sourceUrl: '',
    })
  }

  const resetPriceForm = () => {
    setPriceFormData({
      source: 'Janaushadhi',
      price: '',
      currency: 'INR',
      packaging: '',
      availability: 'available',
      location: { state: '', city: '', district: '' },
      sourceUrl: '',
    })
  }

  const startEdit = (medicine) => {
    setEditingMedicine(medicine)
    setFormData({
      genericName: medicine.genericName || '',
      brandName: medicine.brandName || '',
      manufacturer: medicine.manufacturer || '',
      composition: medicine.composition || [{ ingredient: '', dosage: '' }],
      form: medicine.form || '',
      strength: medicine.strength || '',
      packaging: medicine.packaging || '',
      indications: medicine.indications || '',
      category: medicine.category || '',
      schedule: medicine.schedule || '',
      isPrescriptionRequired: medicine.isPrescriptionRequired || false,
      source: medicine.source || 'Manual',
      sourceUrl: medicine.sourceUrl || '',
    })
    setShowAddForm(true)
  }

  if (loading) {
    return (
      <div className="admin-medicines-page">
        <main className="admin-medicines-main">
          <div className="container">
            <div className="loading-state">Loading medicines...</div>
          </div>
        </main>
      </div>
    )
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="admin-medicines-page">
        <main className="admin-medicines-main">
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
    <div className="admin-medicines-page" ref={containerRef}>
      <main className="admin-medicines-main">
        <div className="container">
          <div className="admin-medicines-header">
            <Pill size={48} className="admin-medicines-icon" />
            <h1>Manage Medicines</h1>
            <p>Add and manage medicines from Janaushadhi and DavaIndia</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="admin-medicines-actions">
            <button
              onClick={() => {
                resetForm()
                setEditingMedicine(null)
                setShowAddForm(!showAddForm)
              }}
              className="btn btn-primary"
            >
              <Plus size={18} />
              <span>{showAddForm ? 'Cancel' : 'Add Medicine'}</span>
            </button>
          </div>

          {showAddForm && (
            <div className="medicine-form-card">
              <h3>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</h3>
              <form onSubmit={handleSubmit} className="medicine-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Generic Name *</label>
                    <input
                      type="text"
                      value={formData.genericName}
                      onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Brand Name *</label>
                    <input
                      type="text"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Manufacturer</label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Source *</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      required
                    >
                      <option value="Janaushadhi">Janaushadhi</option>
                      <option value="DavaIndia">DavaIndia</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Form</label>
                    <input
                      type="text"
                      value={formData.form}
                      onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                      placeholder="Tablet, Capsule, Syrup, etc."
                    />
                  </div>
                  <div className="form-group">
                    <label>Strength</label>
                    <input
                      type="text"
                      value={formData.strength}
                      onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                      placeholder="500mg, 10mg/5ml"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Composition *</label>
                  {formData.composition.map((comp, idx) => (
                    <div key={idx} className="composition-row">
                      <input
                        type="text"
                        placeholder="Ingredient"
                        value={comp.ingredient}
                        onChange={(e) => {
                          const newComp = [...formData.composition]
                          newComp[idx].ingredient = e.target.value
                          setFormData({ ...formData, composition: newComp })
                        }}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={comp.dosage}
                        onChange={(e) => {
                          const newComp = [...formData.composition]
                          newComp[idx].dosage = e.target.value
                          setFormData({ ...formData, composition: newComp })
                        }}
                        required
                      />
                      {formData.composition.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newComp = formData.composition.filter((_, i) => i !== idx)
                            setFormData({ ...formData, composition: newComp })
                          }}
                          className="btn-remove"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        composition: [...formData.composition, { ingredient: '', dosage: '' }],
                      })
                    }}
                    className="btn-add-item"
                  >
                    <Plus size={16} />
                    Add Ingredient
                  </button>
                </div>

                <div className="form-group">
                  <label>Indications</label>
                  <textarea
                    value={formData.indications}
                    onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
                    rows={3}
                    placeholder="What this medicine is used for"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Antibiotic, Antipyretic, etc."
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isPrescriptionRequired}
                        onChange={(e) => setFormData({ ...formData, isPrescriptionRequired: e.target.checked })}
                      />
                      Prescription Required
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Source URL</label>
                  <input
                    type="url"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <CheckCircle size={18} />
                    {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingMedicine(null)
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

          <div className="medicines-list">
            {medicines.length === 0 ? (
              <div className="empty-state">
                <Pill size={64} />
                <h3>No medicines found</h3>
                <p>Add your first medicine to get started</p>
              </div>
            ) : (
              medicines.map((medicine) => (
                <div key={medicine.id} className="medicine-card">
                  <div className="medicine-header">
                    <div>
                      <h3>{medicine.brandName}</h3>
                      <p className="medicine-generic">{medicine.genericName}</p>
                      <div className="medicine-meta">
                        {medicine.source && (
                          <span className={`source-badge source-${medicine.source.toLowerCase()}`}>
                            {medicine.source}
                          </span>
                        )}
                        {medicine.form && <span className="meta-tag">{medicine.form}</span>}
                        {medicine.strength && <span className="meta-tag">{medicine.strength}</span>}
                      </div>
                    </div>
                    <div className="medicine-actions">
                      <button
                        onClick={() => startEdit(medicine)}
                        className="btn-icon"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(medicine.id)}
                        className="btn-icon btn-danger"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {medicine.manufacturer && (
                    <p className="medicine-info"><strong>Manufacturer:</strong> {medicine.manufacturer}</p>
                  )}
                  {medicine.indications && (
                    <p className="medicine-info"><strong>Indications:</strong> {medicine.indications}</p>
                  )}

                  <div className="medicine-prices-section">
                    <div className="section-header">
                      <DollarSign size={18} />
                      <span>Prices ({medicine.prices?.length || 0})</span>
                      <button
                        onClick={() => {
                          if (showPriceForm === medicine.id) {
                            cancelPriceEdit()
                          } else {
                            setEditingPrice(null)
                            resetPriceForm()
                            setShowPriceForm(medicine.id)
                          }
                        }}
                        className="btn-add-price"
                      >
                        <Plus size={16} />
                        Add Price
                      </button>
                    </div>

                    {medicine.prices && medicine.prices.length > 0 && (
                      <div className="prices-list">
                        {medicine.prices.map((price) => (
                          <div key={price.id} className="price-item">
                            <div className="price-info">
                              <div className="price-main">
                                <span className="price-amount">₹{parseFloat(price.price).toFixed(2)}</span>
                                <span className="price-source">{price.source}</span>
                                {price.availability && (
                                  <span className={`price-availability ${price.availability}`}>
                                    {price.availability.replace('_', ' ')}
                                  </span>
                                )}
                              </div>
                              {price.location && (price.location.state || price.location.city) && (
                                <div className="price-location">
                                  <MapPin size={14} />
                                  {[price.location.state, price.location.city].filter(Boolean).join(', ')}
                                </div>
                              )}
                              {price.packaging && (
                                <div className="price-packaging">{price.packaging}</div>
                              )}
                            </div>
                            <div className="price-actions">
                              <button
                                onClick={() => startEditPrice(medicine.id, price)}
                                className="btn-icon"
                                title="Edit Price"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeletePrice(medicine.id, price.id)}
                                className="btn-icon btn-danger"
                                title="Delete Price"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {showPriceForm === medicine.id && (
                      <form onSubmit={(e) => handleAddPrice(medicine.id, e)} className="price-form">
                        <h4>{editingPrice ? 'Edit Price' : 'Add New Price'}</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Source *</label>
                            <select
                              value={priceFormData.source}
                              onChange={(e) => setPriceFormData({ ...priceFormData, source: e.target.value })}
                              required
                            >
                              <option value="Janaushadhi">Janaushadhi</option>
                              <option value="DavaIndia">DavaIndia</option>
                              <option value="Local Pharmacy">Local Pharmacy</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Price (INR) *</label>
                            <input
                              type="number"
                              step="0.01"
                              value={priceFormData.price}
                              onChange={(e) => setPriceFormData({ ...priceFormData, price: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Availability</label>
                            <select
                              value={priceFormData.availability}
                              onChange={(e) => setPriceFormData({ ...priceFormData, availability: e.target.value })}
                            >
                              <option value="available">Available</option>
                              <option value="out_of_stock">Out of Stock</option>
                              <option value="discontinued">Discontinued</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Packaging</label>
                            <input
                              type="text"
                              value={priceFormData.packaging}
                              onChange={(e) => setPriceFormData({ ...priceFormData, packaging: e.target.value })}
                              placeholder="e.g., Strip of 10"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>State</label>
                            <input
                              type="text"
                              value={priceFormData.location.state}
                              onChange={(e) => setPriceFormData({
                                ...priceFormData,
                                location: { ...priceFormData.location, state: e.target.value },
                              })}
                            />
                          </div>
                          <div className="form-group">
                            <label>City</label>
                            <input
                              type="text"
                              value={priceFormData.location.city}
                              onChange={(e) => setPriceFormData({
                                ...priceFormData,
                                location: { ...priceFormData.location, city: e.target.value },
                              })}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Source URL</label>
                          <input
                            type="url"
                            value={priceFormData.sourceUrl}
                            onChange={(e) => setPriceFormData({ ...priceFormData, sourceUrl: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>

                        <div className="form-actions">
                          <button type="submit" className="btn btn-primary btn-sm">
                            <CheckCircle size={16} />
                            {editingPrice ? 'Update Price' : 'Add Price'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelPriceEdit}
                            className="btn btn-secondary btn-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

