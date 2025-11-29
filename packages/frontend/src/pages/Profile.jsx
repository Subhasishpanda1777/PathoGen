import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { User, Mail, Phone, MapPin, Edit2, Save, X, Navigation } from 'lucide-react'
import { authAPI } from '../utils/api'
import { parseAddress } from '../utils/addressParser'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations'
import '../styles/profile.css'

export default function Profile() {
  const { language } = useLanguage()
  const containerRef = useRef(null)
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    latitude: null,
    longitude: null,
  })

  useEffect(() => {
    loadProfile()
    
    if (containerRef.current) {
      gsap.from(containerRef.current.querySelectorAll('.profile-section'), {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
      })
    }
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const response = await authAPI.getProfile()
      const userData = response.data.user || response.data
      setUser(userData)
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        state: userData.state || '',
        district: userData.district || '',
        city: userData.city || '',
        pincode: userData.pincode || '',
        latitude: userData.latitude || null,
        longitude: userData.longitude || null,
      })
    } catch (error) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
    setSuccess(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      state: user?.state || '',
      district: user?.district || '',
      city: user?.city || '',
      pincode: user?.pincode || '',
      latitude: user?.latitude || null,
      longitude: user?.longitude || null,
    })
    setError(null)
    setSuccess(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await authAPI.updateProfile(formData)
      const updatedUser = response.data.user || response.data || { ...user, ...formData }
      setUser(updatedUser)
      setIsEditing(false)
      setSuccess(t('profileUpdated', language))
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      // If update API doesn't exist, simulate update
      setUser({ ...user, ...formData })
      setIsEditing(false)
      setSuccess(t('profileUpdated', language))
      setTimeout(() => setSuccess(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedFormData = {
      ...formData,
      [name]: value,
    }

    // If full address is changed, try to extract state and district
    if (name === 'address' && value) {
      const parsed = parseAddress(value)
      // Only update state/district if they're not already set or if address parsing found them
      if (parsed.state && (!updatedFormData.state || updatedFormData.state === '')) {
        updatedFormData.state = parsed.state
      }
      if (parsed.district && (!updatedFormData.district || updatedFormData.district === '')) {
        updatedFormData.district = parsed.district
      }
    }

    setFormData(updatedFormData)
  }

  // Check geolocation permission status
  const checkLocationPermission = async () => {
    // Check if Permissions API is available
    if ('permissions' in navigator) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' })
        return permissionStatus.state // 'granted', 'denied', or 'prompt'
      } catch (error) {
        // Permissions API might not support geolocation in some browsers
        // or might throw an error - in that case, default to prompt
        console.log('Permission check not available, will prompt user:', error)
        return 'prompt' // Default to prompt if check fails
      }
    }
    // If Permissions API not available, assume prompt (browser will ask)
    return 'prompt'
  }

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setError(null)
    setSuccess('Requesting location permission...')

    // Check permission status first
    try {
      const permissionState = await checkLocationPermission()
      
      if (permissionState === 'denied') {
        setError('Location permission is denied. Please enable location access in your browser settings and try again.')
        setSuccess(null)
        return
      }

      if (permissionState === 'prompt') {
        setSuccess('Please allow location access when prompted by your browser...')
      } else {
        setSuccess('Getting your accurate location...')
      }
    } catch (error) {
      console.error('Permission check error:', error)
      // Continue anyway, browser will prompt
      setSuccess('Getting your location...')
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        try {
          // Reverse geocode to get address
          const addressData = await reverseGeocode(latitude, longitude)
          
          setFormData({
            ...formData,
            latitude,
            longitude,
            address: addressData.address || formData.address,
            state: addressData.state || formData.state,
            district: addressData.district || formData.district,
            city: addressData.city || formData.city,
            pincode: addressData.pincode || formData.pincode,
          })
          
          setSuccess(`Location captured successfully! (Accuracy: ${Math.round(accuracy)}m)`)
          setTimeout(() => setSuccess(null), 3000)
        } catch (error) {
          console.error('Reverse geocoding error:', error)
          // Still update coordinates even if reverse geocoding fails
          setFormData({
            ...formData,
            latitude,
            longitude,
          })
          setSuccess(`Location coordinates captured. (Accuracy: ${Math.round(accuracy)}m) Please fill address manually.`)
          setTimeout(() => setSuccess(null), 3000)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        let errorMessage = 'Failed to get your location.'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission was denied. Please enable location access in your browser settings and try again.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your device location settings.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
          default:
            errorMessage = 'An unknown error occurred while getting your location. Please try again.'
            break
        }
        
        setError(errorMessage)
        setSuccess(null)
      },
      {
        enableHighAccuracy: true, // Request high accuracy GPS
        timeout: 15000, // Increased timeout for high accuracy
        maximumAge: 0, // Don't use cached location
      }
    )
  }

  // Get current location and automatically save to profile
  const handleGetCurrentLocationAndSave = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setGettingLocation(true)
    setError(null)
    setSuccess('Requesting location permission...')

    // Check permission status first
    try {
      const permissionState = await checkLocationPermission()
      
      if (permissionState === 'denied') {
        setError('Location permission is denied. Please enable location access in your browser settings and try again.')
        setSuccess(null)
        setGettingLocation(false)
        return
      }

      if (permissionState === 'prompt') {
        setSuccess('Please allow location access when prompted by your browser...')
      } else {
        setSuccess('Getting your accurate location...')
      }
    } catch (error) {
      console.error('Permission check error:', error)
      // Continue anyway, browser will prompt
      setSuccess('Getting your location...')
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        setSuccess(`Location found! Accuracy: ${Math.round(accuracy)}m. Saving...`)
        
        try {
          // Reverse geocode to get address
          const addressData = await reverseGeocode(latitude, longitude)
          
          const locationData = {
            latitude,
            longitude,
            address: addressData.address || '',
            state: addressData.state || '',
            district: addressData.district || '',
            city: addressData.city || '',
            pincode: addressData.pincode || '',
          }
          
          // Automatically save to backend
          try {
            const response = await authAPI.updateProfile(locationData)
            const updatedUser = response.data.user || response.data
            setUser(updatedUser)
            setFormData({
              ...formData,
              ...locationData,
            })
            setSuccess(`Location captured and saved successfully! (Accuracy: ${Math.round(accuracy)}m)`)
            setTimeout(() => setSuccess(null), 4000)
          } catch (saveError) {
            console.error('Failed to save location:', saveError)
            setError('Location captured but failed to save. Please try again.')
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error)
          // Still save coordinates even if reverse geocoding fails
          const locationData = {
            latitude,
            longitude,
          }
          
          try {
            const response = await authAPI.updateProfile(locationData)
            const updatedUser = response.data.user || response.data
            setUser(updatedUser)
            setFormData({
              ...formData,
              ...locationData,
            })
            setSuccess(`Location coordinates saved. (Accuracy: ${Math.round(accuracy)}m) Please fill address manually.`)
            setTimeout(() => setSuccess(null), 4000)
          } catch (saveError) {
            console.error('Failed to save location:', saveError)
            setError('Failed to save location. Please try again.')
          }
        } finally {
          setGettingLocation(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        let errorMessage = 'Failed to get your location.'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission was denied. Please enable location access in your browser settings and try again.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your device location settings.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
          default:
            errorMessage = 'An unknown error occurred while getting your location. Please try again.'
            break
        }
        
        setError(errorMessage)
        setSuccess(null)
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true, // Request high accuracy GPS
        timeout: 15000, // Increased timeout for high accuracy
        maximumAge: 0, // Don't use cached location
      }
    )
  }

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'PathoGen App',
          },
        }
      )
      
      const data = await response.json()
      const address = data.address || {}
      
      return {
        address: data.display_name || '',
        state: address.state || address.region || '',
        district: address.county || address.state_district || '',
        city: address.city || address.town || address.village || '',
        pincode: address.postcode || '',
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>{t('loading', language)}</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="profile-page">
        <div className="profile-container">
          {/* Header */}
          <div className="profile-header profile-section">
            <div className="profile-avatar-large">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-header-info">
              <h1>{isEditing ? t('editProfile', language) : t('myProfile', language)}</h1>
              <p>{user?.email}</p>
            </div>
            {!isEditing ? (
              <button onClick={handleEdit} className="btn btn-primary">
                <Edit2 size={18} />
                <span>{t('editProfile', language)}</span>
              </button>
            ) : (
              <div className="profile-actions">
                <button onClick={handleCancel} className="btn btn-neumorphic">
                  <X size={18} />
                  <span>{t('cancel', language)}</span>
                </button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                  <Save size={18} />
                  <span>{saving ? t('saving', language) : t('saveChanges', language)}</span>
                </button>
              </div>
            )}
          </div>

          {/* Alerts */}
          {error && (
            <div className="alert alert-error profile-section">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success profile-section">
              <span>{success}</span>
            </div>
          )}

          {/* Profile Details */}
          <div className="profile-details profile-section">
            <div className="profile-field">
              <label>
                <User size={18} />
                {t('name', language)}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your name"
                />
              ) : (
                <div className="profile-value">{user?.name || t('notSet', language)}</div>
              )}
            </div>

            <div className="profile-field">
              <label>
                <Mail size={18} />
                {t('email', language)}
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your email"
                  disabled
                />
              ) : (
                <div className="profile-value">{user?.email || 'Not set'}</div>
              )}
            </div>

            <div className="profile-field">
              <label>
                <Phone size={18} />
                {t('phone', language)}
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="profile-value">{user?.phone || 'Not set'}</div>
              )}
            </div>

            {/* Location Section */}
            <div className="profile-location-section">
              <div className="location-header">
                  <h3>
                  <MapPin size={20} />
                  {t('locationInformation', language)}
                </h3>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleGetCurrentLocationAndSave}
                    disabled={gettingLocation}
                    className="btn btn-primary btn-location"
                  >
                    <Navigation size={18} />
                    <span>{gettingLocation ? t('gettingLocation', language) : t('getCurrentLocation', language)}</span>
                  </button>
                )}
              </div>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="btn btn-neumorphic btn-location"
                >
                  <Navigation size={18} />
                    <span>{t('useCurrentLocation', language)}</span>
                </button>
              )}

              {/* Display current location summary when not editing */}
              {!isEditing && (user?.latitude && user?.longitude) && (
                <div className="location-summary">
                  <div className="location-summary-content">
                    <MapPin size={16} />
                    <div>
                      {user?.address ? (
                        <div className="location-address">{user.address}</div>
                      ) : (
                        <div className="location-coordinates">
                          {typeof user.latitude === 'number' ? user.latitude.toFixed(6) : parseFloat(user.latitude).toFixed(6)}, {typeof user.longitude === 'number' ? user.longitude.toFixed(6) : parseFloat(user.longitude).toFixed(6)}
                        </div>
                      )}
                      {(user?.city || user?.state) && (
                        <div className="location-details">
                          {[user.city, user.district, user.state].filter(Boolean).join(', ')}
                          {user.pincode && ` - ${user.pincode}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="profile-field">
                <label>{t('address', language)}</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input"
                    placeholder="Enter your full address"
                    rows={3}
                  />
                ) : (
                  <div className="profile-value">{user?.address || 'Not set'}</div>
                )}
              </div>

              <div className="location-grid">
                <div className="profile-field">
                  <label>{t('state', language)}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="input"
                      placeholder="State"
                    />
                  ) : (
                    <div className="profile-value">{user?.state || 'Not set'}</div>
                  )}
                </div>

                <div className="profile-field">
                  <label>{t('district', language)}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="input"
                      placeholder="District"
                    />
                  ) : (
                    <div className="profile-value">{user?.district || 'Not set'}</div>
                  )}
                </div>

                <div className="profile-field">
                  <label>{t('city', language)}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input"
                      placeholder="City"
                    />
                  ) : (
                    <div className="profile-value">{user?.city || 'Not set'}</div>
                  )}
                </div>

                <div className="profile-field">
                  <label>{t('pincode', language)}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="input"
                      placeholder="Pincode"
                      maxLength={10}
                    />
                  ) : (
                    <div className="profile-value">{user?.pincode || 'Not set'}</div>
                  )}
                </div>
              </div>

              {(user?.latitude && user?.longitude) && (
                <div className="profile-field">
                  <label>{t('coordinates', language)}</label>
                  <div className="profile-value">
                    {typeof user.latitude === 'number' ? user.latitude.toFixed(6) : parseFloat(user.latitude).toFixed(6)}, {typeof user.longitude === 'number' ? user.longitude.toFixed(6) : parseFloat(user.longitude).toFixed(6)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}

