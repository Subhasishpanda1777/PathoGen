/**
 * Address Parser Utility
 * Parses full address string to extract state and district
 */

/**
 * Parse state and district from full address
 * Address format examples:
 * - "Uttara P.S, Khordha, Odisha, 752104, India"
 * - "City, District, State, Pincode, Country"
 * - "Street, City, District, State"
 */
export function parseAddress(address) {
  if (!address || typeof address !== 'string') {
    return { state: '', district: '' }
  }

  // List of Indian states for matching
  const indianStates = [
    'Andaman And Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh',
    'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra And Nagar Haveli And Daman And Diu',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu And Kashmir',
    'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
    'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ]

  // Clean and normalize address
  const cleanAddress = address.trim()
  
  // Split by comma and clean each part
  const parts = cleanAddress.split(',').map(part => part.trim()).filter(part => part.length > 0)
  
  let state = ''
  let district = ''

  // Try to find state (usually one of the last parts before pincode/country)
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i]
    
    // Skip pincode (numeric) and country names
    if (/^\d+$/.test(part) || 
        part.toLowerCase() === 'india' || 
        part.toLowerCase() === 'ind') {
      continue
    }

    // Check if this part matches a state name
    const matchedState = indianStates.find(s => 
      s.toLowerCase() === part.toLowerCase() ||
      part.toLowerCase().includes(s.toLowerCase()) ||
      s.toLowerCase().includes(part.toLowerCase())
    )

    if (matchedState) {
      state = matchedState
      // District is usually the part before state
      if (i > 0) {
        district = parts[i - 1]
      }
      break
    }
  }

  // If state not found, try alternative patterns
  if (!state) {
    // Pattern: Look for common state name patterns
    const statePatterns = [
      /(?:^|,)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,?\s*(?:India|\d{6})/i,
      /(?:^|,)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*$/i
    ]

    for (const pattern of statePatterns) {
      const match = cleanAddress.match(pattern)
      if (match) {
        const potentialState = match[1].trim()
        const matchedState = indianStates.find(s => 
          s.toLowerCase() === potentialState.toLowerCase() ||
          potentialState.toLowerCase().includes(s.toLowerCase()) ||
          s.toLowerCase().includes(potentialState.toLowerCase())
        )
        if (matchedState) {
          state = matchedState
          break
        }
      }
    }
  }

  // If still no state, try to extract from the last meaningful part
  if (!state && parts.length > 0) {
    // Remove pincode and country
    const meaningfulParts = parts.filter(part => 
      !/^\d+$/.test(part) && 
      part.toLowerCase() !== 'india' && 
      part.toLowerCase() !== 'ind'
    )

    if (meaningfulParts.length >= 2) {
      // Last part might be state
      const lastPart = meaningfulParts[meaningfulParts.length - 1]
      const matchedState = indianStates.find(s => 
        s.toLowerCase() === lastPart.toLowerCase() ||
        lastPart.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(lastPart.toLowerCase())
      )
      if (matchedState) {
        state = matchedState
        // Second last might be district
        if (meaningfulParts.length >= 2) {
          district = meaningfulParts[meaningfulParts.length - 2]
        }
      }
    }
  }

  return {
    state: state || '',
    district: district || '',
  }
}

/**
 * Extract state and district from user profile
 * Tries state/district fields first, then parses from address if needed
 */
export function extractLocationFromProfile(userData) {
  // First, try to use explicit state and district fields
  if (userData.state && userData.district) {
    return {
      state: userData.state,
      district: userData.district,
    }
  }

  // If state/district not available, parse from full address
  if (userData.address) {
    const parsed = parseAddress(userData.address)
    if (parsed.state) {
      return parsed
    }
  }

  // Fallback: use whatever is available
  return {
    state: userData.state || '',
    district: userData.district || '',
  }
}

