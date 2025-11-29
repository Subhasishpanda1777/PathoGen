/**
 * Location Stores Utility
 * Fetches store location data from backend API
 */

import api from './api'

/**
 * Find store by state and district using backend API
 */
export async function findStoreByLocation(userState, userDistrict) {
  if (!userState) {
    console.warn('[Location Stores] No state provided')
    return null
  }

  try {
    console.log(`[Location Stores] Searching for state: "${userState}", district: "${userDistrict || ''}"`)
    const response = await api.get('/api/location-stores/search', {
      params: {
        state: userState,
        district: userDistrict || '',
      },
    })

    if (response.data.success && response.data.store) {
      console.log(`[Location Stores] Found store:`, response.data.store)
      return response.data.store
    }

    console.warn(`[Location Stores] No store found in response:`, response.data)
    return null
  } catch (err) {
    console.error('[Location Stores] Error finding store:', err)
    if (err.response) {
      console.error('[Location Stores] Error response:', err.response.data)
    }
    return null
  }
}

/**
 * Get Google Maps URL for store location
 */
export function getGoogleMapsUrl(store) {
  if (!store || !store.address) return null
  
  const query = encodeURIComponent(store.address)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}
