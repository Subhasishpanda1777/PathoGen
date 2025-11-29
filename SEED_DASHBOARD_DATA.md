# 🌱 Seed Dashboard Data - Complete Guide

## 📋 Overview

This script creates comprehensive dummy data for the dashboard including:
- **8 Diseases** (Dengue, Malaria, COVID-19, Chikungunya, Typhoid, Influenza, Diarrhea, Hepatitis A)
- **Disease Outbreaks** across **8 states** and **80+ districts**
- **Symptom Reports** with location data (state, district)
- **Infection Index** data by district for the last 4 weeks

## 🚀 How to Run

### Step 1: Navigate to Backend Directory
```bash
cd packages/backend
```

### Step 2: Run the Seeding Script
```bash
pnpm seed:dashboard
```

Or directly:
```bash
node scripts/seed-dashboard-data.js
```

## 📊 What Gets Created

### 1. Diseases (8 total)
- Dengue
- Malaria
- COVID-19
- Chikungunya
- Typhoid
- Influenza
- Diarrhea
- Hepatitis A

Each disease includes:
- Scientific name
- Category
- Description
- Symptoms (JSON array)
- Severity level
- Source (ICMR/MoHFW)

### 2. Disease Outbreaks
- **States Covered**: 8 states
  - Maharashtra
  - Karnataka
  - Tamil Nadu
  - Gujarat
  - West Bengal
  - Bihar
  - Rajasthan
  - Uttar Pradesh

- **Districts**: 10 districts per state (80+ total)
- **Data per District**: 2-4 disease outbreaks
- **Total Outbreaks**: ~200-300 records

Each outbreak includes:
- Disease ID
- State & District
- Case count (50-550 cases)
- Active cases
- Recovered cases
- Deaths
- Risk level (low/medium/high)
- Trend (rising/stable/falling)
- Reported date (within last 30 days)

### 3. Symptom Reports
- **Total Reports**: 400-1200+ reports
- **Distribution**: 5-15 reports per district
- Each report includes:
  - Symptoms (from disease symptoms)
  - Duration (1-20 days)
  - Severity (Mild/Moderate/Severe)
  - Location (state, district, city, coordinates)
  - Created date (within last 30 days)

### 4. Infection Index
- **Records**: 320+ records (4 weeks × 80 districts)
- Each record includes:
  - Week identifier (2024-WXX format)
  - Week start/end dates
  - State & District
  - Index value (20-80)
  - Total reports
  - Disease count

## 🎯 Testing the Dashboard

After seeding, you can:

1. **Select a State** (e.g., Maharashtra)
   - District dropdown will populate with 10 districts
   
2. **Select a District** (e.g., Mumbai)
   - Dashboard will show:
     - Active Outbreaks in Mumbai
     - Recent Reports from Mumbai
     - Trending Diseases in Mumbai
     - Infection Index for Mumbai

3. **Change Date Range**
   - Filter data by 7 days, 30 days, 90 days, or all time

4. **View Heatmap**
   - See state-wise infection index scores
   - Color-coded by risk level

## 📍 Districts by State

### Maharashtra (10 districts)
- Mumbai, Pune, Nagpur, Nashik, Aurangabad, Solapur, Thane, Ahmednagar, Amravati, Kolhapur

### Karnataka (10 districts)
- Bengaluru Urban, Mysuru, Hubballi, Mangaluru, Belagavi, Kalaburagi, Davangere, Ballari, Vijayapura, Shivamogga

### Tamil Nadu (10 districts)
- Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, Tirunelveli, Erode, Vellore, Thanjavur, Dindigul

### Gujarat (10 districts)
- Ahmedabad, Surat, Vadodara, Rajkot, Bhavnagar, Jamnagar, Gandhinagar, Junagadh, Anand, Bharuch

### West Bengal (10 districts)
- Kolkata, Howrah, Durgapur, Asansol, Siliguri, Bardhaman, Malda, Nadia, Hooghly, North 24 Parganas

### Bihar (10 districts)
- Patna, Gaya, Bhagalpur, Muzaffarpur, Purnia, Darbhanga, Araria, Begusarai, Bhojpur, Saran

### Rajasthan (10 districts)
- Jaipur, Jodhpur, Kota, Bikaner, Ajmer, Udaipur, Bhilwara, Alwar, Sikar, Bharatpur

### Uttar Pradesh (10 districts)
- Lucknow, Kanpur, Agra, Varanasi, Allahabad, Meerut, Ghaziabad, Noida, Bareilly, Aligarh

## 🔄 Re-running the Script

The script uses `ON CONFLICT DO NOTHING` for diseases, so:
- **Diseases**: Won't duplicate if already exist
- **Outbreaks**: Will create new records each time (may have duplicates)
- **Reports**: Will create new records each time
- **Infection Index**: Will create new records each time

To start fresh:
```sql
-- Clear existing data (optional)
TRUNCATE TABLE disease_outbreaks CASCADE;
TRUNCATE TABLE symptom_reports CASCADE;
TRUNCATE TABLE infection_index CASCADE;
```

## ✅ Verification

After seeding, verify data:

```sql
-- Check diseases
SELECT COUNT(*) FROM diseases;

-- Check outbreaks by state
SELECT state, COUNT(*) as outbreaks 
FROM disease_outbreaks 
GROUP BY state 
ORDER BY outbreaks DESC;

-- Check outbreaks by district
SELECT state, district, COUNT(*) as outbreaks 
FROM disease_outbreaks 
WHERE state = 'Maharashtra'
GROUP BY state, district 
ORDER BY outbreaks DESC;

-- Check infection index
SELECT state, district, AVG(index_value::numeric) as avg_index
FROM infection_index
WHERE state = 'Maharashtra'
GROUP BY state, district
ORDER BY avg_index DESC;
```

## 🎉 Ready to Test!

Once seeded, your dashboard will have realistic data to test:
- ✅ District filtering
- ✅ Trending diseases by district
- ✅ Infection index by district
- ✅ State-wise heatmap
- ✅ Date range filtering

Enjoy testing! 🚀

