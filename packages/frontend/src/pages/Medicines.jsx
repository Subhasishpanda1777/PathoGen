import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Search, Pill, AlertCircle, MapPin, BookmarkPlus, Navigation, Check, Activity, FileText, Bookmark } from 'lucide-react'
import { medicinesAPI, cartAPI, authAPI } from '../utils/api'
import { findStoreByLocation, getGoogleMapsUrl } from '../utils/locationStores'
import { extractLocationFromProfile } from '../utils/addressParser'
import { getMedicineImageUrl, getFallbackImageUrl, getGuaranteedImageUrl } from '../utils/medicineImages'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations'
import '../styles/medicines.css'

export default function Medicines() {
  const { language } = useLanguage()
  const containerRef = useRef(null)
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('name') // 'name', 'symptom', 'disease'
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedMedicines, setSavedMedicines] = useState(new Set())
  const [saving, setSaving] = useState(new Set())
  const [userLocation, setUserLocation] = useState({ state: '', district: '' })
  const [storeData, setStoreData] = useState(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      })
    }
    loadSavedMedicines()
    loadUserLocation()
  }, [])

  // Reload location when component becomes visible (user navigates back to this page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUserLocation()
      }
    }

    // Reload location when window gains focus
    const handleFocus = () => {
      loadUserLocation()
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadUserLocation = async () => {
    try {
      const response = await authAPI.getProfile()
      const userData = response.data.user || response.data
      
      // Extract state and district from profile (tries state/district fields first, then parses from address)
      const location = extractLocationFromProfile(userData)
      
      setUserLocation(location)
      
      // Load store data if state is available
      if (location.state) {
        const store = await findStoreByLocation(location.state, location.district)
        setStoreData(store)
      }
    } catch (err) {
      console.error('Failed to load user location:', err)
    }
  }

  const loadSavedMedicines = async () => {
    try {
      const response = await cartAPI.getCart()
      const savedIds = new Set(response.data.items.map(item => item.medicine.id))
      setSavedMedicines(savedIds)
    } catch (err) {
      console.error('Failed to load saved medicines:', err)
    }
  }

  const handleSaveMedicine = async (medicineId) => {
    if (saving.has(medicineId)) return

    setSaving(prev => new Set(prev).add(medicineId))
    try {
      if (savedMedicines.has(medicineId)) {
        // Remove from cart - we need to get the cart item ID first
        const cartResponse = await cartAPI.getCart()
        const cartItem = cartResponse.data.items.find(item => item.medicine.id === medicineId)
        if (cartItem) {
          await cartAPI.removeFromCart(cartItem.id)
          setSavedMedicines(prev => {
            const newSet = new Set(prev)
            newSet.delete(medicineId)
            return newSet
          })
        }
      } else {
        // Add to cart
        await cartAPI.addToCart(medicineId)
        setSavedMedicines(prev => new Set(prev).add(medicineId))
        // Show success message
        const medicine = medicines.find(m => m.id === medicineId)
        if (medicine) {
          // Optional: Show a toast notification
          console.log(`Saved ${medicine.brandName || medicine.name} to cart`)
        }
      }
    } catch (err) {
      console.error('Failed to save medicine:', err)
      alert('Failed to save medicine. Please try again.')
    } finally {
      setSaving(prev => {
        const newSet = new Set(prev)
        newSet.delete(medicineId)
        return newSet
      })
    }
  }

  const handleGetDirections = async (medicine) => {
    try {
      // Always fetch the latest location from profile to ensure we have updated district
      let currentState = ''
      let currentDistrict = ''
      
      try {
        const profileResponse = await authAPI.getProfile()
        const userData = profileResponse.data.user || profileResponse.data
        
        // Extract state and district from profile (parses from full address if needed)
        const location = extractLocationFromProfile(userData)
        currentState = location.state
        currentDistrict = location.district
        
        // Update state for future use and reload store data
        setUserLocation(location)
        
        // Reload store data with updated location
        if (currentState) {
          const store = await findStoreByLocation(currentState, currentDistrict)
          setStoreData(store)
        }
      } catch (profileError) {
        console.error('Failed to fetch latest location:', profileError)
        // Fallback to existing location if fetch fails
        currentState = userLocation.state
        currentDistrict = userLocation.district
      }

      if (!currentState) {
        alert('Please update your full address in your profile to get store directions. The address should include your state and district (e.g., "City, District, State, Pincode, India").')
        return
      }

      // Find store based on user's CURRENT state and district from location JSON
      console.log(`[Get Directions] Searching for store - State: "${currentState}", District: "${currentDistrict}"`)
      const store = await findStoreByLocation(currentState, currentDistrict)
      
      if (store) {
        console.log(`[Get Directions] Found store:`, store)
        // Get Google Maps URL for the store
        const mapsUrl = getGoogleMapsUrl(store)
        if (mapsUrl) {
          console.log(`[Get Directions] Opening Google Maps:`, mapsUrl)
          window.open(mapsUrl, '_blank')
        } else {
          alert(`Store: ${store.name}\nKendra Code: ${store.kendraCode}\nAddress: ${store.address}\nContact: ${store.contact}`)
        }
      } else {
        console.error(`[Get Directions] No store found for State: "${currentState}", District: "${currentDistrict}"`)
        alert(`No Janaushadhi store found for ${currentState}${currentDistrict ? `, ${currentDistrict}` : ''}. Please check your profile address includes the correct state and district.`)
      }
    } catch (err) {
      console.error('Error getting directions:', err)
      alert('Failed to get directions. Please try again.')
    }
  }


  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setMedicines([]) // Clear previous results

    try {
      let response
      
      // Ensure only one search type is used at a time
      if (searchType === 'symptom') {
        console.log(`[Medicine Search] Searching by symptom: "${query}"`)
        response = await medicinesAPI.searchBySymptom(query.trim())
      } else if (searchType === 'disease') {
        console.log(`[Medicine Search] Searching by disease: "${query}"`)
        response = await medicinesAPI.searchByDisease(query.trim())
      } else {
        // Search by name
        console.log(`[Medicine Search] Searching by medicine name: "${query}"`)
        response = await medicinesAPI.search(query.trim())
      }
      
      const medicinesList = response.data?.medicines || []
      
      // Filter to ensure only relevant results
      let filteredMedicines = medicinesList
      
      // Additional validation: ensure medicines are actually related
      if (searchType === 'symptom' || searchType === 'disease') {
        // Results should already be filtered by backend, but double-check
        console.log(`[Medicine Search] Received ${medicinesList.length} medicines for ${searchType}: "${query}"`)
      }
      
      setMedicines(Array.isArray(filteredMedicines) ? filteredMedicines : [])
      
      if (filteredMedicines.length === 0) {
        setError(`No medicines found for "${query}" when searching by ${searchType}. Try a different search term or change the search type.`)
      } else {
        console.log(`[Medicine Search] Displaying ${filteredMedicines.length} relevant medicines`)
      }
    } catch (err) {
      console.error('Error searching medicines:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to search medicines. Please try again.'
      setError(errorMessage)
      
      // If it's a database error, show more details
      if (err.response?.data?.details) {
        console.error('Database error details:', err.response.data.details)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="medicines-page" ref={containerRef}>
      <main className="medicines-main">
        <div className="container">
          <div className="medicines-header">
            <Pill size={48} className="medicines-icon" />
            <h1>{t('findAffordableMedicines', language)}</h1>
            <p>{t('searchByMedicineName', language)}</p>
          </div>

          <div className="search-type-selector">
            <button
              type="button"
              className={`search-type-btn ${searchType === 'name' ? 'active' : ''}`}
              onClick={() => setSearchType('name')}
            >
              <Pill size={18} />
              <span>{t('medicineName', language)}</span>
            </button>
            <button
              type="button"
              className={`search-type-btn ${searchType === 'symptom' ? 'active' : ''}`}
              onClick={() => setSearchType('symptom')}
            >
              <Activity size={18} />
              <span>{t('symptom', language)}</span>
            </button>
            <button
              type="button"
              className={`search-type-btn ${searchType === 'disease' ? 'active' : ''}`}
              onClick={() => setSearchType('disease')}
            >
              <FileText size={18} />
              <span>{t('disease', language)}</span>
            </button>
          </div>

          <form onSubmit={handleSearch} className="search-card">
            <div className="search-input-wrapper">
              <Search size={24} className="search-icon" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  searchType === 'name' 
                    ? t('searchByMedicineName', language)
                    : searchType === 'symptom'
                    ? t('searchBySymptom', language)
                    : t('searchByDisease', language)
                }
                className="search-input"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  <span>{t('searching', language)}</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>{t('search', language)}</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {medicines.length > 0 && (
            <div className="medicines-grid">
              {medicines.map((medicine) => {
                const isSaved = savedMedicines.has(medicine.id)
                const isSaving = saving.has(medicine.id)
                const cheapestPrice = medicine.prices?.cheapest
                const price = cheapestPrice ? parseFloat(cheapestPrice.price) : null
                const medicineImageUrl = getMedicineImageUrl(
                  medicine.brandName || medicine.brand_name || medicine.name,
                  medicine.genericName || medicine.generic_name
                )
                
                return (
                  <div key={medicine.id} className="medicine-card">
                    {/* 1. Medicine Image */}
                    <div className="medicine-image-container">
                      <img 
                        src={medicineImageUrl} 
                        alt={`${medicine.brandName || medicine.brand_name || medicine.genericName || medicine.generic_name || 'Medicine'} medicine`}
                        className="medicine-image"
                        loading="lazy"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          const img = e.target
                          // Track how many times we've tried
                          const attemptCount = parseInt(img.dataset.attempts || '0', 10)
                          
                          if (attemptCount === 0) {
                            // First failure - try alternative online source
                            img.dataset.attempts = '1'
                            const altUrl = getFallbackImageUrl(
                              medicine.brandName || medicine.brand_name || medicine.name,
                              medicine.genericName || medicine.generic_name
                            )
                            if (img.src !== altUrl) {
                              img.src = altUrl
                              return
                            }
                          }
                          
                          // Final fallback - guaranteed SVG
                          const svgUrl = getGuaranteedImageUrl(
                            medicine.brandName || medicine.brand_name || medicine.name,
                            medicine.genericName || medicine.generic_name
                          )
                          if (img.src !== svgUrl) {
                            img.src = svgUrl
                          }
                        }}
                        onLoad={(e) => {
                          // Image loaded successfully
                          const img = e.target
                          img.dataset.loaded = 'true'
                          console.log('✅ Medicine image loaded:', medicine.brandName || medicine.genericName || medicine.name)
                        }}
                      />
                    </div>
                    
                    {/* 2. Medicine Name */}
                    <h3 className="medicine-name">{medicine.brandName || medicine.name}</h3>
                    
                    {/* 3. Medicine Type (Generic Name) */}
                    <p className="medicine-generic">
                      <strong>{t('form', language)}:</strong> {medicine.genericName || t('medicine', language)}
                    </p>
                    
                    {/* 4. Kendra Code */}
                    {storeData && storeData.kendraCode && (
                      <div className="medicine-kendra-code">
                        <strong>{t('kendraCode', language)}:</strong> {storeData.kendraCode}
                      </div>
                    )}
                    
                    {/* 5. Strength */}
                    {medicine.strength && (
                      <div className="medicine-strength">
                        <strong>{t('strength', language)}:</strong> {medicine.strength}
                      </div>
                    )}
                    
                    {/* 6. Shop Type */}
                    {medicine.source && (
                      <div className="medicine-source">
                        <span className={`source-badge ${medicine.source.toLowerCase()}`}>
                          {medicine.source}
                        </span>
                      </div>
                    )}
                    
                    {/* 7. Price */}
                    {price && (
                      <div className="medicine-price-section">
                        <span className="price-label">{t('price', language)}</span>
                        <span className="medicine-price">₹{price.toFixed(2)}</span>
                        {medicine.prices?.count > 1 && (
                          <span className="price-source">
                            ({medicine.prices.count} {t('sources', language)})
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* 8. Action Buttons */}
                    <div className="medicine-actions">
                      <button
                        className={`save-btn ${isSaved ? 'saved' : ''}`}
                        onClick={() => handleSaveMedicine(medicine.id)}
                        disabled={isSaving}
                        title={isSaved ? t('removeFromCart', language) : t('saveToCart', language)}
                      >
                        {isSaving ? (
                          <div className="spinner-small"></div>
                        ) : isSaved ? (
                          <>
                            <Bookmark size={18} />
                            <span>{t('saved', language)}</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus size={18} />
                            <span>{t('save', language)}</span>
                          </>
                        )}
                      </button>
                      <button
                        className="direction-btn"
                        onClick={() => handleGetDirections(medicine)}
                        title={t('getDirections', language)}
                      >
                        <Navigation size={18} />
                        <span>{t('getDirections', language)}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && medicines.length === 0 && query && !error && (
            <div className="empty-state">
              <Pill size={64} />
              <h3>No results found</h3>
              <p>Try searching with a different term</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
