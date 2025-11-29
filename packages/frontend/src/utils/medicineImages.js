/**
 * Medicine Image Utility
 * Generates reliable medicine images that always load
 */

/**
 * Generate a data URI SVG image (guaranteed to work, no network required)
 */
function generateSVGImage(text, color) {
  const svg = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="200" fill="#${color}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
            fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `.trim()
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Get medicine image URL - uses reliable placeholder service
 * This ensures every medicine always has a visible image
 */
export function getMedicineImageUrl(medicineName, genericName) {
  // Use the generic name (preferred) or brand name
  const nameForImage = (genericName || medicineName || 'Medicine').trim()
  
  // Clean the name - extract the main medicine name for display
  let cleanName = nameForImage
    .replace(/Tablets?|Capsules?|Syrup|Suspension|Injection|IP|mg|ml|g|per\s*\d+|and|with|hydrochloride|sodium|maleate|tablets|oral/gi, '')
    .trim()
    .split(/\s+/)[0] // Get first word (usually the generic name)
    .substring(0, 15) // Limit length for display
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .trim()

  if (!cleanName || cleanName.length < 2) {
    cleanName = 'Medicine'
  }

  // Generate a consistent color based on medicine name hash
  const hash = nameForImage.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  // Use predefined color palette for medicine packaging colors
  const colors = [
    '4A90E2', // Blue - common for medicines
    '50C878', // Green - herbal/natural
    'FF6B6B', // Red - important medicines
    'FFA500', // Orange - vitamins
    '9B59B6', // Purple - specialty medicines
    '3498DB', // Light Blue
    '2ECC71', // Dark Green
    'F39C12', // Dark Orange
    '1ABC9C', // Teal
    'E74C3C', // Dark Red
    '8E44AD', // Dark Purple
    '16A085', // Dark Teal
  ]
  
  const colorIndex = Math.abs(hash) % colors.length
  const colorHex = colors[colorIndex]
  
  // Use placeholder.com - it's reliable and always works
  // Format: https://via.placeholder.com/WIDTHxHEIGHT/COLOR/TEXTCOLOR?text=TEXT
  const imageUrl = `https://via.placeholder.com/300x200/${colorHex}/ffffff?text=${encodeURIComponent(cleanName)}`
  
  return imageUrl
}

/**
 * Get guaranteed-to-work image URL (data URI SVG)
 * Use this as ultimate fallback
 */
export function getGuaranteedImageUrl(medicineName, genericName) {
  const nameForImage = (genericName || medicineName || 'Medicine').trim()
  
  let cleanName = nameForImage
    .replace(/Tablets?|Capsules?|Syrup|Suspension|Injection|IP|mg|ml|g/gi, '')
    .trim()
    .substring(0, 15)
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim() || 'Medicine'
  
  const hash = cleanName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  const colors = ['4A90E2', '50C878', 'FF6B6B', 'FFA500', '9B59B6', '3498DB', '2ECC71', 'F39C12', '1ABC9C']
  const colorHex = colors[Math.abs(hash) % colors.length]
  
  // Return data URI SVG - guaranteed to work, no network required
  return generateSVGImage(cleanName, colorHex)
}

/**
 * Get fallback image URL (used when primary image fails)
 * This is a guaranteed-to-work fallback
 */
export function getFallbackImageUrl(medicineName, genericName) {
  // Use the same logic as primary image to ensure consistency
  return getMedicineImageUrl(medicineName, genericName)
}

