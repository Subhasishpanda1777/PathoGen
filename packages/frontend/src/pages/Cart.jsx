import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ShoppingCart, Pill, Trash2, MapPin, AlertCircle, X } from 'lucide-react'
import { cartAPI, medicinesAPI, authAPI } from '../utils/api'
import { findStoreByLocation, getGoogleMapsUrl } from '../utils/locationStores'
import { extractLocationFromProfile } from '../utils/addressParser'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations'
import '../styles/cart.css'

export default function Cart() {
  const { language } = useLanguage()
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removing, setRemoving] = useState(new Set())
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
    loadCart()
    loadUserLocation()
  }, [])

  // Reload location when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUserLocation()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleVisibilityChange)
    }
  }, [])

  const loadUserLocation = async () => {
    try {
      const profileResponse = await authAPI.getProfile()
      const userData = profileResponse.data.user || profileResponse.data
      
      // Extract state and district from profile (parses from full address if needed)
      const location = extractLocationFromProfile(userData)
      setUserLocation(location)
      
      // Load store data if we have location
      if (location.state) {
        const store = await findStoreByLocation(location.state, location.district)
        setStoreData(store)
      }
    } catch (err) {
      console.error('Failed to load user location:', err)
      // Don't show error to user, just log it
    }
  }

  const loadCart = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await cartAPI.getCart()
      setCartItems(response.data.items || [])
    } catch (err) {
      console.error('Failed to load cart:', err)
      setError('Failed to load saved medicines. Please try again.')
      if (err.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (cartItemId, medicineId) => {
    if (removing.has(cartItemId)) return

    setRemoving(prev => new Set(prev).add(cartItemId))
    try {
      await cartAPI.removeFromCart(cartItemId)
      setCartItems(prev => prev.filter(item => item.id !== cartItemId))
    } catch (err) {
      console.error('Failed to remove medicine:', err)
      alert('Failed to remove medicine. Please try again.')
    } finally {
      setRemoving(prev => {
        const newSet = new Set(prev)
        newSet.delete(cartItemId)
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
      console.log(`[Cart - Get Directions] Searching for store - State: "${currentState}", District: "${currentDistrict}"`)
      const store = await findStoreByLocation(currentState, currentDistrict)
      
      if (store) {
        console.log(`[Cart - Get Directions] Found store:`, store)
        // Get Google Maps URL for the store
        const mapsUrl = getGoogleMapsUrl(store)
        if (mapsUrl) {
          console.log(`[Cart - Get Directions] Opening Google Maps:`, mapsUrl)
          window.open(mapsUrl, '_blank')
        } else {
          alert(`Store: ${store.name}\nKendra Code: ${store.kendraCode}\nAddress: ${store.address}\nContact: ${store.contact}`)
        }
      } else {
        console.error(`[Cart - Get Directions] No store found for State: "${currentState}", District: "${currentDistrict}"`)
        alert(`No Janaushadhi store found for ${currentState}${currentDistrict ? `, ${currentDistrict}` : ''}. Please check your profile address includes the correct state and district.`)
      }
    } catch (err) {
      console.error('Error getting directions:', err)
      alert('Failed to get directions. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="cart-page">
        <main className="cart-main">
          <div className="container">
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Loading your saved medicines...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="cart-page" ref={containerRef}>
      <main className="cart-main">
        <div className="container">
          <div className="cart-header">
            <ShoppingCart size={48} className="cart-icon" />
            <h1>{t('mySavedMedicines', language)}</h1>
            <p>{t('viewAndManage', language)}</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <ShoppingCart size={64} />
              <h3>{t('emptyCart', language)}</h3>
              <p>{t('saveMedicinesFromSearch', language)}</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/medicines')}
              >
                {t('browseMedicines', language)}
              </button>
            </div>
          ) : (
            <>
              <div className="cart-summary">
                <p className="cart-count">
                  {cartItems.length} {cartItems.length === 1 ? t('medicine', language) : t('medicines', language)} {t('saved', language)}
                </p>
              </div>

              <div className="cart-grid">
                {cartItems.map((item) => {
                  const medicine = item.medicine
                  const cheapestPrice = item.prices?.cheapest
                  const price = cheapestPrice ? parseFloat(cheapestPrice.price) : null
                  const isRemoving = removing.has(item.id)

                  return (
                    <div key={item.id} className="cart-item-card">
                      <div className="cart-item-header">
                        <div className="cart-item-icon">
                          <Pill size={32} />
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemove(item.id, medicine.id)}
                          disabled={isRemoving}
                          title="Remove from cart"
                        >
                          {isRemoving ? (
                            <div className="spinner-small"></div>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>

                      <h3 className="cart-item-name">{medicine.brandName}</h3>
                      <p className="cart-item-generic">{medicine.genericName}</p>

                      <div className="cart-item-info">
                        {medicine.manufacturer && (
                          <p className="cart-item-detail">
                            <strong>{t('manufacturer', language)}:</strong> {medicine.manufacturer}
                          </p>
                        )}
                        {medicine.form && (
                          <p className="cart-item-detail">
                            <strong>{t('form', language)}:</strong> {medicine.form}
                          </p>
                        )}
                        {medicine.strength && (
                          <p className="cart-item-detail">
                            <strong>{t('strength', language)}:</strong> {medicine.strength}
                          </p>
                        )}
                      </div>

                      {price && (
                        <div className="cart-item-price-section">
                          <span className="price-label">{t('from', language)}</span>
                          <span className="cart-item-price">₹{price.toFixed(2)}</span>
                          {item.prices?.count > 1 && (
                            <span className="price-source">
                              ({item.prices.count} {t('sources', language)})
                            </span>
                          )}
                        </div>
                      )}

                      {medicine.source && (
                        <div className="cart-item-source">
                          <span className={`source-badge ${medicine.source.toLowerCase()}`}>
                            {medicine.source}
                          </span>
                        </div>
                      )}

                      {/* Kendra Code - Show if store data is available */}
                      {storeData && storeData.kendraCode && (
                        <div className="cart-item-kendra-code">
                          <strong>{t('kendraCode', language)}:</strong> {storeData.kendraCode}
                        </div>
                      )}

                      <div className="cart-item-actions">
                        <button
                          className="btn btn-secondary direction-btn-full"
                          onClick={() => handleGetDirections(medicine)}
                        >
                          <MapPin size={18} />
                          <span>{t('getDirections', language)}</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

