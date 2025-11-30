import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Send,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Upload,
  File,
  Image as ImageIcon,
} from 'lucide-react'
import { symptomsAPI, authAPI } from '../utils/api'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations'
import '../styles/report.css'

const COMMON_SYMPTOMS = [
  'Fever', 'Cough', 'Headache', 'Fatigue', 'Body Ache',
  'Sore Throat', 'Runny Nose', 'Nausea', 'Diarrhea', 'Vomiting',
  'Difficulty Breathing', 'Chest Pain', 'Loss of Taste', 'Loss of Smell',
]

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

export default function Report() {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [customSymptoms, setCustomSymptoms] = useState([])
  const [customSymptomInput, setCustomSymptomInput] = useState('')
  const [duration, setDuration] = useState(1)
  const [severity, setSeverity] = useState('Mild')
  const [location, setLocation] = useState({ state: '', district: '', city: '' })
  const [additionalDetails, setAdditionalDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showCustomSymptoms, setShowCustomSymptoms] = useState(false)
  const [symptomSearch, setSymptomSearch] = useState('')
  const [showSymptomSuggestions, setShowSymptomSuggestions] = useState(false)
  const [showAllSymptoms, setShowAllSymptoms] = useState(false)
  const [reportFile, setReportFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [fileType, setFileType] = useState(null)

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile()
    
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      })
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      const userData = response.data.user || response.data
      setUserProfile(userData)
      
      // Pre-fill location from user profile if available
      if (userData.state || userData.district || userData.city) {
        setLocation({
          state: userData.state || '',
          district: userData.district || '',
          city: userData.city || '',
        })
      }
    } catch (error) {
      // User might not be logged in, that's okay for anonymous reports
      console.log('Could not load user profile:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const getLocationWithCoordinates = () => {
    const locationData = { ...location }
    
    // Add coordinates from user profile if available
    if (userProfile?.latitude && userProfile?.longitude) {
      locationData.coordinates = {
        latitude: typeof userProfile.latitude === 'number' 
          ? userProfile.latitude 
          : parseFloat(userProfile.latitude),
        longitude: typeof userProfile.longitude === 'number' 
          ? userProfile.longitude 
          : parseFloat(userProfile.longitude),
      }
    }
    
    return locationData
  }

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    )
  }

  const addCustomSymptom = () => {
    const trimmed = customSymptomInput.trim()
    if (trimmed && !customSymptoms.includes(trimmed) && !COMMON_SYMPTOMS.includes(trimmed)) {
      setCustomSymptoms((prev) => [...prev, trimmed])
      setSelectedSymptoms((prev) => [...prev, trimmed])
      setCustomSymptomInput('')
    }
  }

  const removeCustomSymptom = (symptom) => {
    setCustomSymptoms((prev) => prev.filter((s) => s !== symptom))
    setSelectedSymptoms((prev) => prev.filter((s) => s !== symptom))
  }

  const handleCustomSymptomKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomSymptom()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    const fileTypeLower = file.type.toLowerCase()
    const isValidType = validTypes.includes(fileTypeLower) || 
                       file.name.toLowerCase().endsWith('.pdf') ||
                       file.name.toLowerCase().endsWith('.png') ||
                       file.name.toLowerCase().endsWith('.jpg') ||
                       file.name.toLowerCase().endsWith('.jpeg')

    if (!isValidType) {
      setError(t('pleaseUploadValidFile', language))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('fileSizeMustBeLess', language))
      return
    }

    setReportFile(file)
    setError(null)

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result)
        setFileType('image')
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(file.name)
      setFileType('pdf')
    }
  }

  const removeFile = () => {
    setReportFile(null)
    setFilePreview(null)
    setFileType(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const allSymptoms = [...selectedSymptoms]
    
    if (allSymptoms.length === 0) {
      setError(t('pleaseSelectAtLeastOneSymptom', language))
      return
    }

    if (!location.state) {
      setError(t('pleaseSelectYourState', language))
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Convert file to base64 if present
      let fileUrl = null
      if (reportFile) {
        fileUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(reportFile)
        })
      }

      await symptomsAPI.submitReport({
        symptoms: allSymptoms,
        duration,
        severity,
        location: getLocationWithCoordinates(),
        description: additionalDetails || undefined,
        imageUrl: fileUrl || undefined,
      })

      setSuccess(true)
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.message || t('failedToSubmitReport', language))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="report-page">
        <div className="report-success">
          <div className="container">
            <div className="success-card">
              <CheckCircle size={64} className="success-icon" />
              <h1>{t('reportSubmittedSuccessfully', language)}</h1>
              <p>{t('thankYouForContributing', language)}</p>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                {t('goToDashboard', language)}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="report-page" ref={containerRef}>
          <main className="report-main">
            <div className="container">
              <div className="report-header">
                <Shield size={48} className="report-icon" />
                <h1>{t('reportSymptoms', language)}</h1>
                <p>{t('helpTrackDiseaseOutbreaks', language)}</p>
              </div>

              <form onSubmit={handleSubmit} className="report-form">
                {error && (
                  <div className="alert alert-error">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="report-section">
                  <h3>{t('selectYourSymptoms', language)}</h3>
                  
                  {/* Symptoms Search Section */}
                  <div className="symptoms-search-section">
                    <div className="symptom-search-wrapper">
                      <input
                        id="symptom-search"
                        type="text"
                        value={symptomSearch}
                        onChange={(e) => {
                          setSymptomSearch(e.target.value)
                          setShowSymptomSuggestions(true)
                          setShowAllSymptoms(false)
                        }}
                        onFocus={() => {
                          if (symptomSearch) {
                            setShowSymptomSuggestions(true)
                          } else {
                            setShowAllSymptoms(true)
                          }
                        }}
                        onBlur={() => setTimeout(() => {
                          setShowSymptomSuggestions(false)
                          setShowAllSymptoms(false)
                        }, 200)}
                        placeholder="Type to search symptoms or click dropdown to see all..."
                        className="symptom-search-input"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowAllSymptoms(!showAllSymptoms)
                          setShowSymptomSuggestions(false)
                          if (!showAllSymptoms) {
                            setSymptomSearch('')
                          }
                        }}
                        className="dropdown-toggle-btn"
                        title="Show all symptoms"
                      >
                        <ChevronDown size={20} className={showAllSymptoms ? 'rotate' : ''} />
                      </button>
                      {symptomSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setSymptomSearch('')
                            setShowSymptomSuggestions(false)
                            setShowAllSymptoms(false)
                          }}
                          className="clear-search-btn"
                          title="Clear search"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>

                    {/* All Symptoms Dropdown */}
                    {showAllSymptoms && !symptomSearch && (
                      <div className="all-symptoms-dropdown">
                        <div className="all-symptoms-header">
                          <span>{t('allSymptoms', language)} ({COMMON_SYMPTOMS.length})</span>
                        </div>
                        <div className="all-symptoms-list">
                    {COMMON_SYMPTOMS.map((symptom) => (
                      <button
                        key={symptom}
                        type="button"
                              onClick={() => {
                                toggleSymptom(symptom)
                                setShowAllSymptoms(false)
                              }}
                              className={`all-symptom-item ${selectedSymptoms.includes(symptom) ? 'selected' : ''}`}
                      >
                              <span>{symptom}</span>
                              {selectedSymptoms.includes(symptom) ? (
                                <CheckCircle size={18} />
                              ) : (
                                <Plus size={16} />
                              )}
                      </button>
                    ))}
                        </div>
                      </div>
                    )}

                    {/* Search Suggestions Dropdown */}
                    {showSymptomSuggestions && symptomSearch && (
                      <div className="symptom-suggestions">
                        {COMMON_SYMPTOMS.filter(symptom =>
                          symptom.toLowerCase().includes(symptomSearch.toLowerCase()) &&
                          !selectedSymptoms.includes(symptom)
                        ).map((symptom) => (
                          <button
                            key={symptom}
                            type="button"
                            onClick={() => {
                              toggleSymptom(symptom)
                              setSymptomSearch('')
                              setShowSymptomSuggestions(false)
                            }}
                            className="symptom-suggestion-item"
                          >
                            <span>{symptom}</span>
                            <Plus size={16} />
                          </button>
                        ))}
                        {COMMON_SYMPTOMS.filter(symptom =>
                          symptom.toLowerCase().includes(symptomSearch.toLowerCase()) &&
                          !selectedSymptoms.includes(symptom)
                        ).length === 0 && (
                          <div className="no-suggestions">{t('noMatchingSymptoms', language)}</div>
                        )}
                      </div>
                    )}

                    {/* Selected Symptoms Display */}
                    {selectedSymptoms.length > 0 && (
                      <div className="selected-symptoms-display">
                        <p className="selected-symptoms-label">
                          {t('selectedSymptoms', language)} ({selectedSymptoms.length}):
                        </p>
                        <div className="selected-symptoms-chips">
                          {selectedSymptoms.map((symptom) => (
                            <div key={symptom} className="selected-symptom-chip">
                              <span>{symptom}</span>
                              <button
                                type="button"
                                onClick={() => toggleSymptom(symptom)}
                                className="remove-symptom-btn"
                                title="Remove"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom Symptoms Dropdown */}
                  <div className="custom-symptoms-dropdown">
                    <button
                      type="button"
                      onClick={() => setShowCustomSymptoms(!showCustomSymptoms)}
                      className="custom-symptoms-toggle"
                    >
                      <span>{t('addCustomSymptoms', language)}</span>
                      {showCustomSymptoms ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {showCustomSymptoms && (
                      <div className="custom-symptoms-content">
                        <p className="custom-symptoms-hint">{t('cantFindSymptom', language)}</p>
                        <div className="custom-symptom-input-group">
                          <input
                            type="text"
                            value={customSymptomInput}
                            onChange={(e) => setCustomSymptomInput(e.target.value)}
                            onKeyPress={handleCustomSymptomKeyPress}
                            placeholder={t('enterYourSymptom', language)}
                            className="input custom-symptom-input"
                            maxLength={50}
                          />
                          <button
                            type="button"
                            onClick={addCustomSymptom}
                            disabled={!customSymptomInput.trim()}
                            className="btn btn-primary btn-add-symptom"
                          >
                            <Plus size={18} />
                            <span>{t('add', language)}</span>
                          </button>
                        </div>

                        {/* Display Custom Symptoms */}
                        {customSymptoms.length > 0 && (
                          <div className="custom-symptoms-display">
                            {customSymptoms.map((symptom) => (
                              <div
                                key={symptom}
                                className={`custom-symptom-chip ${selectedSymptoms.includes(symptom) ? 'custom-symptom-chip-active' : ''}`}
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleSymptom(symptom)}
                                  className="custom-symptom-chip-content"
                                >
                                  {symptom}
                                  {selectedSymptoms.includes(symptom) && <CheckCircle size={14} />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeCustomSymptom(symptom)}
                                  className="custom-symptom-chip-remove"
                                  title="Remove"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="report-section">
                  <h3>{t('duration', language)}: {duration} {t('days', language)}</h3>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="duration-slider"
                  />
                  <div className="duration-labels">
                    <span>1 {t('day', language)}</span>
                    <span>30 {t('days', language)}</span>
                  </div>
                </div>

                <div className="report-section">
                  <h3>{t('severity', language)}</h3>
                  <div className="severity-buttons">
                    {['Mild', 'Moderate', 'Severe'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSeverity(level)}
                        className={`severity-btn ${severity === level ? `severity-${level.toLowerCase()}` : ''}`}
                      >
                        {t(level.toLowerCase(), language)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="report-section">
                  <h3>{t('location', language)}</h3>
                  <div className="location-grid">
                    <div className="form-group">
                      <label className="form-label">{t('state', language)} *</label>
                      <select
                        value={location.state}
                        onChange={(e) => setLocation({ ...location, state: e.target.value })}
                        required
                        className="input"
                      >
                        <option value="">{t('selectState', language)}</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t('district', language)}</label>
                      <input
                        type="text"
                        value={location.district}
                        onChange={(e) => setLocation({ ...location, district: e.target.value })}
                        placeholder={t('enterDistrict', language)}
                        className="input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t('city', language)}</label>
                      <input
                        type="text"
                        value={location.city}
                        onChange={(e) => setLocation({ ...location, city: e.target.value })}
                        placeholder={t('enterCity', language)}
                        className="input"
                      />
                    </div>
                  </div>
                </div>

                <div className="report-section">
                  <h3>{t('uploadFile', language)} ({t('optional', language)})</h3>
                  <p className="section-hint">{t('uploadFileHint', language)}</p>
                  {!reportFile ? (
                    <label htmlFor="report-file" className="file-upload-label">
                      <Upload size={24} />
                      <span>{t('clickToUpload', language)}</span>
                      <span className="file-upload-hint">{t('fileUploadHint', language)}</span>
                      <input
                        id="report-file"
                        type="file"
                        accept=".pdf,.png,.jpeg,.jpg,application/pdf,image/png,image/jpeg,image/jpg"
                        onChange={handleFileChange}
                        className="file-upload-input"
                      />
                    </label>
                  ) : (
                    <div className="file-preview-container">
                      {fileType === 'image' ? (
                        <div className="file-preview-image">
                          <img src={filePreview} alt="File preview" />
                          <button
                            type="button"
                            onClick={removeFile}
                            className="remove-file-btn"
                            title="Remove file"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="file-preview-document">
                          <File size={48} />
                          <span>{filePreview}</span>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="remove-file-btn"
                            title="Remove file"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="report-section">
                  <h3>{t('additionalDetails', language)} ({t('optional', language)})</h3>
                  <textarea
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    placeholder={t('anyAdditionalInformation', language)}
                    rows={4}
                    className="input textarea"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-large btn-submit"
                >
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      <span>{t('submitting', language)}</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>{t('submitReport', language)}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </main>
        </div>
  )
}
