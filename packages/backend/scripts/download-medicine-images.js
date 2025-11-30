/**
 * Generate Medicine Images Script
 * Generates images for all Janaushadhi medicines using SVG
 * Stores them in public/medicine-images/ folder
 */

import dotenv from 'dotenv'
import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sql = postgres({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pathogen',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
})

// Create medicine-images folder if it doesn't exist
const imagesDir = path.join(__dirname, '../../frontend/public/medicine-images')
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
  console.log('✅ Created medicine-images folder')
}

/**
 * Clean medicine name for filename
 */
function cleanNameForFilename(name) {
  if (!name) return ''
  
  return name
    .toLowerCase()
    .replace(/tablets?|capsules?|syrup|suspension|injection|ip|mg|ml|g|per\s*\d+|and|with|hydrochloride|sodium|maleate|tablets|oral|hcl|sulphate|sulfate|\(|\)/gi, '')
    .trim()
    .split(/\s+/)[0] // Get first word
    .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
    .substring(0, 30)
}

/**
 * Generate a simple colored image with medicine name
 */
function generateMedicineImage(medicineName) {
  // Generate consistent color based on name
  const hash = medicineName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  const colors = [
    { bg: '#4A90E2', text: '#FFFFFF' }, // Blue
    { bg: '#50C878', text: '#FFFFFF' }, // Green
    { bg: '#FF6B6B', text: '#FFFFFF' }, // Red
    { bg: '#FFA500', text: '#FFFFFF' }, // Orange
    { bg: '#9B59B6', text: '#FFFFFF' }, // Purple
    { bg: '#3498DB', text: '#FFFFFF' }, // Light Blue
    { bg: '#2ECC71', text: '#FFFFFF' }, // Dark Green
    { bg: '#F39C12', text: '#FFFFFF' }, // Dark Orange
    { bg: '#1ABC9C', text: '#FFFFFF' }, // Teal
    { bg: '#E74C3C', text: '#FFFFFF' }, // Dark Red
    { bg: '#8E44AD', text: '#FFFFFF' }, // Dark Purple
    { bg: '#16A085', text: '#FFFFFF' }, // Dark Teal
  ]
  
  const color = colors[Math.abs(hash) % colors.length]
  const shortName = medicineName.substring(0, 15).toUpperCase()
  
  // Generate SVG image
  const svg = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="200" fill="${color.bg}"/>
  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="20" font-weight="bold" 
        fill="${color.text}" text-anchor="middle" dominant-baseline="middle">${shortName}</text>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="14" 
        fill="${color.text}" text-anchor="middle" dominant-baseline="middle" opacity="0.9">MEDICINE</text>
</svg>`
  
  return svg
}

/**
 * Main function to generate images for all Janaushadhi medicines
 */
async function generateImages() {
  try {
    console.log('🔍 Fetching all Janaushadhi medicines from database...\n')
    
    // Get all unique generic names from Janaushadhi medicines
    const medicines = await sql`
      SELECT DISTINCT generic_name
      FROM medicines
      WHERE source = 'Janaushadhi'
        AND is_active = true
      ORDER BY generic_name
    `
    
    console.log(`📦 Found ${medicines.length} unique Janaushadhi medicines\n`)
    console.log('🖼️  Starting image generation...\n')
    
    let successCount = 0
    let skipCount = 0
    
    for (let i = 0; i < medicines.length; i++) {
      const medicine = medicines[i]
      const genericName = medicine.generic_name
      const cleanName = cleanNameForFilename(genericName)
      
      if (!cleanName) {
        console.log(`⏭️  [${i + 1}/${medicines.length}] Skipping: ${genericName} (invalid name)`)
        skipCount++
        continue
      }
      
      const filepath = path.join(imagesDir, `${cleanName}.svg`)
      
      // Skip if image already exists
      if (fs.existsSync(filepath)) {
        console.log(`✅ [${i + 1}/${medicines.length}] Already exists: ${genericName} → ${cleanName}.svg`)
        successCount++
        continue
      }
      
      console.log(`📝 [${i + 1}/${medicines.length}] Generating: ${genericName} → ${cleanName}.svg`)
      
      // Generate image
      const svg = generateMedicineImage(genericName)
      fs.writeFileSync(filepath, svg)
      
      console.log(`  ✅ Saved: ${cleanName}.svg`)
      successCount++
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 Summary:')
    console.log(`   ✅ Successfully processed: ${successCount}`)
    console.log(`   ⏭️  Skipped: ${skipCount}`)
    console.log(`   📁 Images saved to: ${imagesDir}`)
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await sql.end()
  }
}

// Run the script
generateImages()
  .then(() => {
    console.log('\n✅ Image generation completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

