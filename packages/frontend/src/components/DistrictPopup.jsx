import { useState, useEffect } from 'react'
import { X, MapPin, AlertCircle } from 'lucide-react'
import { authAPI, dashboardAPI } from '../utils/api'
import '../styles/district-popup.css'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

export default function DistrictPopup() {
  const [show, setShow] = useState(false)
  const [user, setUser] = useState(null)
  const [selectedState, setSelectedState] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [districts, setDistricts] = useState([])
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkUserDistrict()
  }, [])

  useEffect(() => {
    if (selectedState) {
      loadDistricts(selectedState)
    } else {
      setDistricts([])
      setSelectedDistrict('')
    }
  }, [selectedState])

  const checkUserDistrict = async () => {
    try {
      const response = await authAPI.getProfile()
      const userData = response.data.user || response.data
      setUser(userData)
      
      // Show popup if district is not set
      if (!userData.district || !userData.state) {
        setShow(true)
        if (userData.state) {
          setSelectedState(userData.state)
        }
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
    }
  }

  const loadDistricts = async (state) => {
    setLoadingDistricts(true)
    try {
      const response = await dashboardAPI.getDistricts(state)
      const districtsList = response.data?.districts || []
      setDistricts(districtsList)
    } catch (err) {
      console.error('Failed to load districts:', err)
      setDistricts([])
    } finally {
      setLoadingDistricts(false)
    }
  }

  const handleSave = async () => {
    if (!selectedState || !selectedDistrict) {
      setError('Please select both state and district')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await authAPI.updateProfile({
        state: selectedState,
        district: selectedDistrict,
      })
      
      // Update local user state
      setUser({ ...user, state: selectedState, district: selectedDistrict })
      setShow(false)
    } catch (error) {
      console.error('Failed to save district:', error)
      setError('Failed to save district. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = () => {
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="district-popup-overlay">
      <div className="district-popup">
        <div className="district-popup-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #4D9AFF 0%, #1B7BFF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <MapPin size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#1A1A1A' }}>
                Set Your Location
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>
                Help us send you personalized disease alerts
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280',
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        <div className="district-popup-content">
          <div style={{ 
            background: '#FEF3C7', 
            border: '1px solid #FCD34D', 
            borderRadius: '8px', 
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'start'
          }}>
            <AlertCircle size={20} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#92400E', fontWeight: 500 }}>
                Why we need your location?
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#78350F' }}>
                We'll send you daily email alerts about trending diseases and prevention measures specific to your district.
              </p>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              color: '#991B1B',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: 600,
                color: '#1A1A1A'
              }}>
                State *
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value)
                  setSelectedDistrict('')
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: 600,
                color: '#1A1A1A'
              }}>
                District *
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedState || loadingDistricts}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: selectedState && !loadingDistricts ? '#FFFFFF' : '#F3F4F6',
                  cursor: selectedState && !loadingDistricts ? 'pointer' : 'not-allowed',
                  opacity: selectedState && !loadingDistricts ? 1 : 0.6
                }}
              >
                <option value="">
                  {!selectedState
                    ? 'Select State First'
                    : loadingDistricts
                      ? 'Loading Districts...'
                      : districts.length === 0
                        ? 'No Districts Found'
                        : 'Select District'}
                </option>
                {!loadingDistricts && districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="district-popup-footer">
          <button
            onClick={handleSkip}
            disabled={saving}
            style={{
              padding: '10px 20px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              background: '#FFFFFF',
              color: '#6B7280',
              fontSize: '14px',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Skip for Now
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedState || !selectedDistrict}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '8px',
              background: (!selectedState || !selectedDistrict || saving) ? '#D1D5DB' : '#1B7BFF',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: (!selectedState || !selectedDistrict || saving) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {saving ? 'Saving...' : 'Save Location'}
          </button>
        </div>
      </div>
    </div>
  )
}

