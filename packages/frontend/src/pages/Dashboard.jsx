import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Activity,
  TrendingUp,
  AlertCircle,
  BarChart3,
  MapPin,
  RotateCcw,
  Map as MapIcon,
} from 'lucide-react'
import { dashboardAPI, authAPI } from '../utils/api'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations'
import '../styles/dashboard.css'

gsap.registerPlugin(ScrollTrigger)

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

export default function Dashboard() {
  const { language } = useLanguage()
  const containerRef = useRef(null)
  const [stats, setStats] = useState({
    activeOutbreaks: 0,
    recentReports: 0,
    trendingDiseasesCount: 0,
  })
  const [trendingDiseases, setTrendingDiseases] = useState([])
  const [infectionIndex, setInfectionIndex] = useState(null)
  const [heatmapData, setHeatmapData] = useState([])
  const [districts, setDistricts] = useState([])
  const [filters, setFilters] = useState({ 
    state: undefined, 
    district: undefined, 
    dateRange: '30d' 
  })
  const [loading, setLoading] = useState(true)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [error, setError] = useState(null)

  // Load districts when state changes
  useEffect(() => {
    if (filters.state) {
      loadDistricts(filters.state)
    } else {
      setDistricts([])
      setFilters(prev => ({ ...prev, district: undefined }))
    }
  }, [filters.state])

  // Load dashboard data when filters change
  useEffect(() => {
    loadDashboardData()
    
    // GSAP Animations
    if (containerRef.current) {
      gsap.from(containerRef.current.querySelectorAll('.dashboard-card'), {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      })
    }
  }, [filters])

  // Load districts for selected state
  const loadDistricts = async (state) => {
    if (!state) {
      setDistricts([])
      return
    }
    
    setLoadingDistricts(true)
    try {
      console.log(`Loading districts for state: ${state}`)
      const response = await dashboardAPI.getDistricts(state)
      const districtsList = response.data?.districts || []
      console.log(`Loaded ${districtsList.length} districts for ${state}:`, districtsList.slice(0, 5))
      setDistricts(districtsList)
    } catch (err) {
      console.error('Failed to load districts:', err)
      console.error('Error details:', err.response?.data || err.message)
      setDistricts([])
    } finally {
      setLoadingDistricts(false)
    }
  }

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [statsRes, trendingRes, indexRes, heatmapRes] = await Promise.all([
        dashboardAPI.getStats(filters),
        dashboardAPI.getTrendingDiseases(filters),
        dashboardAPI.getInfectionIndex(filters),
        dashboardAPI.getHeatmapData({ dateRange: filters.dateRange }),
      ])

      setStats(statsRes.data.stats)
      
      // Filter trending diseases to only show those from the selected district
      let filteredTrending = trendingRes.data.trendingDiseases || []
      if (filters.district) {
        // Only show diseases that match the selected district
        filteredTrending = filteredTrending.filter(item => 
          item.district === filters.district
        )
        console.log(`Filtered trending diseases for district ${filters.district}:`, filteredTrending.length, 'out of', trendingRes.data.trendingDiseases?.length || 0)
      }
      
      // Deduplicate by disease NAME (case-insensitive) to ensure each disease appears only once
      // This handles cases where same disease might have different IDs
      const seenDiseaseNames = new Map()
      filteredTrending.forEach(item => {
        const diseaseName = item.disease?.name
        if (!diseaseName) return // Skip items without name
        
        const diseaseNameLower = diseaseName.toLowerCase().trim()
        if (!seenDiseaseNames.has(diseaseNameLower)) {
          seenDiseaseNames.set(diseaseNameLower, item)
        } else {
          // If duplicate found (same name), keep the one with higher case count
          const existing = seenDiseaseNames.get(diseaseNameLower)
          const existingCases = existing?.totalCases || 0
          const currentCases = item?.totalCases || 0
          if (currentCases > existingCases) {
            seenDiseaseNames.set(diseaseNameLower, item)
          }
        }
      })
      
      const uniqueTrending = Array.from(seenDiseaseNames.values())
      // Sort by case count (descending)
      uniqueTrending.sort((a, b) => (b.totalCases || 0) - (a.totalCases || 0))
      
      // Verify no duplicates by name
      const diseaseNames = uniqueTrending.map(item => item.disease?.name?.toLowerCase().trim()).filter(Boolean)
      const uniqueNames = new Set(diseaseNames)
      if (diseaseNames.length !== uniqueNames.size) {
        console.error(`❌ CRITICAL: Still have duplicate disease names! Total: ${diseaseNames.length}, Unique: ${uniqueNames.size}`)
        console.error('Disease names:', diseaseNames)
        // Additional deduplication pass
        const finalMap = new Map()
        uniqueTrending.forEach(item => {
          const name = item.disease?.name?.toLowerCase().trim()
          if (name && !finalMap.has(name)) {
            finalMap.set(name, item)
          }
        })
        const finalTrending = Array.from(finalMap.values())
        finalTrending.sort((a, b) => (b.totalCases || 0) - (a.totalCases || 0))
        console.log(`🔧 Final deduplication: ${finalTrending.length} unique diseases`)
        setTrendingDiseases(finalTrending)
      } else {
        console.log(`✅ Deduplicated trending diseases: ${uniqueTrending.length} out of ${filteredTrending.length} (all unique by name)`)
        setTrendingDiseases(uniqueTrending)
      }
      
      // Get infection index for selected district, or latest for state
      const indexData = indexRes.data.infectionIndex || []
      if (filters.district && indexData.length > 0) {
        const districtIndex = indexData.find(item => item.district === filters.district)
        setInfectionIndex(districtIndex || indexData[0] || null)
      } else {
        setInfectionIndex(indexData[0] || null)
      }
      
      setHeatmapData(heatmapRes.data.heatmap || [])
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Reset filters
  const handleReset = () => {
    setFilters({ state: undefined, district: undefined, dateRange: '30d' })
    setDistricts([])
  }

  // Get risk color for infection index
  const getInfectionIndexColor = (indexValue) => {
    if (!indexValue) return '#94a3b8'
    if (indexValue >= 70) return '#ef4444' // High - Red
    if (indexValue >= 40) return '#f59e0b' // Medium - Orange
    return '#10b981' // Low - Green
  }

  // Get risk level from infection index
  const getRiskLevel = (indexValue) => {
    if (!indexValue) return t('unknown', language)
    if (indexValue >= 70) return t('high', language)
    if (indexValue >= 40) return t('medium', language)
    return t('low', language)
  }

  // Get heatmap color for state
  const getHeatmapColor = (infectionIndex) => {
    if (!infectionIndex) return '#e2e8f0'
    if (infectionIndex >= 70) return '#dc2626' // High - Bright Red
    if (infectionIndex >= 60) return '#ea580c' // High-Medium - Orange Red
    if (infectionIndex >= 50) return '#f59e0b' // Medium-High - Orange
    if (infectionIndex >= 40) return '#eab308' // Medium - Yellow
    if (infectionIndex >= 30) return '#84cc16' // Low-Medium - Lime
    if (infectionIndex >= 20) return '#22c55e' // Low - Green
    return '#10b981' // Very Low - Bright Green
  }

  return (
    <div className="dashboard-page" ref={containerRef}>
      <main className="dashboard-main">
        <div className="container">
          {/* Header */}
          <div className="dashboard-header">
            <h1>{t('healthDashboard', language)}</h1>
            <p>{t('realTimeInsights', language)}</p>
          </div>

          {/* Filters */}
          <div className="dashboard-card filters-card">
            <h3>{t('filters', language)}</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label>{t('state', language)}</label>
                <select
                  value={filters.state || ''}
                  onChange={(e) => {
                    const newState = e.target.value || undefined
                    setFilters({ ...filters, state: newState, district: undefined })
                  }}
                  className="input"
                >
                  <option value="">{t('allStates', language)}</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>{t('district', language)}</label>
                <select
                  value={filters.district || ''}
                  onChange={(e) => setFilters({ ...filters, district: e.target.value || undefined })}
                  className="input"
                  disabled={!filters.state || loadingDistricts}
                >
                  <option value="">
                    {!filters.state 
                      ? t('selectStateFirst', language)
                      : loadingDistricts 
                        ? t('loadingDistricts', language)
                        : districts.length === 0
                          ? t('noDistrictsFound', language)
                          : t('allDistricts', language)}
                  </option>
                  {!loadingDistricts && districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>{t('dateRange', language)}</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="input"
                >
                  <option value="7d">{t('last7Days', language)}</option>
                  <option value="30d">{t('last30Days', language)}</option>
                  <option value="90d">{t('last90Days', language)}</option>
                  <option value="all">{t('allTime', language)}</option>
                </select>
              </div>

              <button
                onClick={handleReset}
                className="btn btn-neumorphic"
                style={{ alignSelf: 'flex-end' }}
              >
                <RotateCcw size={18} />
                {t('resetFilters', language)}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="stats-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="dashboard-card stat-card loading">
                  <div className="stat-skeleton"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="stats-grid">
              <div className="dashboard-card stat-card">
                <div className="stat-icon stat-icon-danger">
                  <AlertCircle size={32} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.activeOutbreaks.toLocaleString('en-IN')}</div>
                  <div className="stat-label">{t('activeOutbreaks', language)}</div>
                </div>
              </div>

              <div className="dashboard-card stat-card">
                <div className="stat-icon stat-icon-success">
                  <Activity size={32} />
                </div>
                <div className="stat-content">
                  <div className="stat-value stat-value-success">
                    {stats.recentReports.toLocaleString('en-IN')}
                  </div>
                  <div className="stat-label">{t('recentReports', language)}</div>
                </div>
              </div>

              <div className="dashboard-card stat-card">
                <div className="stat-icon stat-icon-warning">
                  <TrendingUp size={32} />
                </div>
                <div className="stat-content">
                  <div className="stat-value stat-value-warning">
                    {stats.trendingDiseasesCount.toLocaleString('en-IN')}
                  </div>
                  <div className="stat-label">{t('trendingDiseases', language)}</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Trending Diseases with District Info */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>
                <TrendingUp size={24} />
                {t('trendingDiseasesIn', language)} {filters.district && `${t('in', language)} ${filters.district}`}
              </h3>
            </div>
            <div className="card-content">
              {loading ? (
                <div className="loading-list">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="list-item-skeleton"></div>
                  ))}
                </div>
              ) : trendingDiseases.length === 0 ? (
                <div className="empty-state">{t('noTrendingDiseasesData', language)}</div>
              ) : (
                <div className="trending-list">
                  {trendingDiseases.map((item, index) => (
                    <div key={`${item.disease?.id || 'unknown'}-${item.district || 'no-district'}-${index}`} className="trending-item">
                      <div className="trending-rank">{index + 1}</div>
                      <div className="trending-info">
                        <div className="trending-name">{item.disease?.name || t('unknownDisease', language)}</div>
                        <div className="trending-meta">
                          {item.district && (
                            <span className="trending-location">
                              <MapPin size={14} />
                              {item.district}
                            </span>
                          )}
                          <span className="trending-cases">
                            {item.totalCases?.toLocaleString('en-IN') || 0} {t('cases', language)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* District Infection Index */}
          {infectionIndex && (
            <div className="dashboard-card">
              <div className="card-header">
                <h3>
                  <BarChart3 size={24} />
                  {t('infectionIndexScore', language)}
                  {filters.district && ` - ${filters.district}`}
                </h3>
              </div>
              <div className="card-content">
                <div className="infection-index-display">
                  <div className="infection-index-value" style={{ 
                    color: getInfectionIndexColor(infectionIndex.indexValue) 
                  }}>
                    {infectionIndex.indexValue?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="infection-index-details">
                    <div className="infection-index-label">
                      <span className="risk-badge" style={{ 
                        backgroundColor: getInfectionIndexColor(infectionIndex.indexValue) 
                      }}>
                        {getRiskLevel(infectionIndex.indexValue)}
                      </span>
                    </div>
                    {infectionIndex.district && (
                      <div className="infection-index-location">
                        <MapPin size={16} />
                        {infectionIndex.district}, {infectionIndex.state}
                      </div>
                    )}
                    <div className="infection-index-stats">
                      <span>{t('recentReports', language)}: {infectionIndex.totalReports || 0}</span>
                      <span>{t('trendingDiseases', language)}: {infectionIndex.diseaseCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* India Heatmap */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>
                <MapIcon size={24} />
                {t('indiaHeatmap', language)}
              </h3>
            </div>
            <div className="card-content">
              {loading ? (
                <div className="loading-list">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="list-item-skeleton"></div>
                  ))}
                </div>
              ) : heatmapData.length === 0 ? (
                <div className="empty-state">{t('noHeatmapData', language)}</div>
              ) : (
                <div className="heatmap-container">
                  <div className="heatmap-grid">
                    {heatmapData.map((item, index) => (
                      <div
                        key={item.state || index}
                        className="heatmap-state"
                        style={{
                          backgroundColor: getHeatmapColor(item.infectionIndex),
                          color: item.infectionIndex >= 50 ? '#ffffff' : '#1e293b',
                        }}
                        title={`${item.state}: Index ${item.infectionIndex?.toFixed(1) || 'N/A'}`}
                      >
                        <div className="heatmap-state-name">{item.state}</div>
                        <div className="heatmap-state-index">
                          {item.infectionIndex?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="heatmap-state-cases">
                          {item.totalCases?.toLocaleString('en-IN') || 0} cases
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="heatmap-legend">
                    <div className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: '#dc2626' }}></span>
                      <span>{t('high', language)} (70+)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
                      <span>{t('medium', language)} (40-69)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: '#22c55e' }}></span>
                      <span>{t('low', language)} (0-39)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
