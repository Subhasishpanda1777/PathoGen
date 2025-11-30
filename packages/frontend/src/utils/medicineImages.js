/**
 * Medicine Image Utility
 * Gets real medicine images from online sources based on medicine name
 * Uses multiple strategies with intelligent fallbacks
 */

/**
 * Clean medicine name for image search
 */
function cleanNameForImage(medicineName, genericName) {
  const nameForImage = (genericName || medicineName || 'Medicine').trim()
  
  return nameForImage
    .replace(/tablets?|capsules?|syrup|suspension|injection|ip|mg|ml|g|per\s*\d+/gi, '')
    .replace(/hydrochloride|sodium|maleate|hcl|sulphate|sulfate/gi, '')
    .replace(/[()]/g, '')
    .trim()
    .split(/\s+/)[0]
    .substring(0, 30)
    .trim() || 'medicine'
}

/**
 * Generate color based on medicine name
 */
function getColorFromName(name) {
  if (!name) return '667eea'
  
  const hash = name.toLowerCase().split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  const colors = [
    '667eea', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 
    '06b6d4', 'ec4899', '14b8a6', '6366f1', 'f97316',
    '22c55e', '3b82f6'
  ]
  
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Escape text for XML/SVG
 */
function escapeXml(text) {
  if (!text) return 'Medicine'
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Generate SVG fallback image
 */
function generateSVGImage(medicineName, genericName) {
  const cleanName = cleanNameForImage(medicineName, genericName)
  const displayName = (genericName || medicineName || 'Medicine')
    .trim()
    .substring(0, 18)
    .toUpperCase()
    .trim() || 'MEDICINE'
  
  const color = getColorFromName(cleanName)
  const safeText = escapeXml(displayName)
  const gradientId = 'grad' + Math.abs(cleanName.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0))
  
  const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#${color}" stop-opacity="1"/>
        <stop offset="100%" stop-color="#${color}" stop-opacity="0.85"/>
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#${gradientId})" rx="8"/>
    <ellipse cx="200" cy="120" rx="60" ry="35" fill="rgba(255,255,255,0.2)" opacity="0.5"/>
    <ellipse cx="200" cy="120" rx="50" ry="30" fill="rgba(255,255,255,0.15)" opacity="0.6"/>
    <text x="200" y="200" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${safeText}</text>
    <text x="200" y="230" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.9)" text-anchor="middle" dominant-baseline="middle">MEDICINE</text>
  </svg>`
  
  const encodedSvg = encodeURIComponent(svg)
  return `data:image/svg+xml;charset=utf-8,${encodedSvg}`
}

/**
 * Get medicine image URL from online sources
 * Tries multiple strategies to find real medicine images
 */
function getOnlineMedicineImage(medicineName, genericName) {
  const cleanGeneric = cleanNameForImage(medicineName, genericName)
  const fullGeneric = (genericName || '').trim()
  const fullBrand = (medicineName || '').trim()
  
  // Strategy 1: Try Unsplash Source API (free, searches for images)
  // This searches Unsplash for medicine/tablet/pill images
  const searchTerm = cleanGeneric || 'medicine'
  const unsplashUrl = `https://source.unsplash.com/400x300/?medicine,${encodeURIComponent(searchTerm)},tablet,pill,pharmaceutical`
  
  // Strategy 2: Use placeholder with medicine name (as intermediate fallback)
  // This at least shows the medicine name
  const displayName = (genericName || medicineName || 'Medicine').substring(0, 20).trim()
  const color = getColorFromName(cleanGeneric)
  const placeholderUrl = `https://via.placeholder.com/400x300/${color}/ffffff?text=${encodeURIComponent(displayName.toUpperCase())}`
  
  // Return Unsplash URL - it searches for actual medicine images
  return unsplashUrl
}

/**
 * Get alternative online image URL
 */
function getAlternativeOnlineImage(medicineName, genericName) {
  const cleanGeneric = cleanNameForImage(medicineName, genericName)
  const displayName = (genericName || medicineName || 'Medicine').substring(0, 20).trim()
  const color = getColorFromName(cleanGeneric)
  
  // Use placeholder service with medicine name
  return `https://via.placeholder.com/400x300/${color}/ffffff?text=${encodeURIComponent(displayName.toUpperCase())}`
}

/**
 * Get medicine image URL
 * Tries online sources first, falls back to SVG
 */
export function getMedicineImageUrl(medicineName, genericName) {
  try {
    const onlineUrl = getOnlineMedicineImage(medicineName, genericName)
    if (onlineUrl) {
      return onlineUrl
    }
  } catch (error) {
    console.warn('Error getting online medicine image:', error)
  }
  
  // Fallback to SVG
  return generateSVGImage(medicineName, genericName)
}

/**
 * Get fallback image URL
 * Tries alternative online source
 */
export function getFallbackImageUrl(medicineName, genericName) {
  try {
    // Try alternative online source
    const altUrl = getAlternativeOnlineImage(medicineName, genericName)
    if (altUrl) {
      return altUrl
    }
  } catch (error) {
    console.warn('Error getting alternative image:', error)
  }
  
  // Fallback to SVG
  return generateSVGImage(medicineName, genericName)
}

/**
 * Get guaranteed-to-work image URL
 * Uses SVG - always works offline
 */
export function getGuaranteedImageUrl(medicineName, genericName) {
  return generateSVGImage(medicineName, genericName)
}
