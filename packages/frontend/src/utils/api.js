import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  sendOTP: (data) => api.post('/api/auth/send-otp', data),
  verifyOTP: (data) => api.post('/api/auth/verify-otp', data),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  updateEmailNotifications: (enabled) => api.put('/api/auth/email-notifications', { enabled }),
}

// Admin API
export const adminAPI = {
  login: (data) => api.post('/api/admin/login', data),
  // Medicines
  getMedicines: () => api.get('/api/admin/medicines'),
  createMedicine: (data) => api.post('/api/admin/medicines', data),
  updateMedicine: (id, data) => api.put(`/api/admin/medicines/${id}`, data),
  deleteMedicine: (id) => api.delete(`/api/admin/medicines/${id}`),
  addMedicinePrice: (id, data) => api.post(`/api/admin/medicines/${id}/prices`, data),
  updateMedicinePrice: (medicineId, priceId, data) => api.put(`/api/admin/medicines/${medicineId}/prices/${priceId}`, data),
  deleteMedicinePrice: (medicineId, priceId) => api.delete(`/api/admin/medicines/${medicineId}/prices/${priceId}`),
  // Symptoms
  getSymptoms: () => api.get('/api/admin/symptoms'),
  createSymptom: (data) => api.post('/api/admin/symptoms', data),
  updateSymptom: (id, data) => api.put(`/api/admin/symptoms/${id}`, data),
  deleteSymptom: (id) => api.delete(`/api/admin/symptoms/${id}`),
}

// Dashboard API
export const dashboardAPI = {
  getStats: (filters = {}) => {
    const params = {}
    if (filters.state) params.state = filters.state
    if (filters.district) params.district = filters.district
    if (filters.dateRange) params.dateRange = filters.dateRange
    return api.get('/api/dashboard/stats', { params })
  },
  getTrendingDiseases: (filters = {}) => {
    const params = { limit: filters.limit || 10 }
    if (filters.state) params.state = filters.state
    if (filters.district) params.district = filters.district
    if (filters.dateRange) params.dateRange = filters.dateRange
    return api.get('/api/dashboard/trending-diseases', { params })
  },
  getInfectionIndex: (filters = {}) => {
    const params = {}
    if (filters.state) params.state = filters.state
    if (filters.district) params.district = filters.district
    if (filters.dateRange) params.dateRange = filters.dateRange
    return api.get('/api/dashboard/infection-index', { params })
  },
  getHeatmapData: (filters = {}) => {
    const params = {}
    if (filters.dateRange) params.dateRange = filters.dateRange
    return api.get('/api/dashboard/heatmap-data', { params })
  },
  getDistricts: (state) => {
    if (!state) return Promise.resolve({ data: { districts: [] } })
    return api.get('/api/dashboard/districts', { params: { state } })
  },
  getPreventionMeasures: (state, district) => {
    if (!state || !district) return Promise.resolve({ data: { preventionMeasures: {} } })
    return api.get('/api/dashboard/prevention-measures', { params: { state, district } })
  },
  getHealthRiskScore: () => api.get('/api/dashboard/health-risk-score'),
}

// Symptoms API
export const symptomsAPI = {
  submitReport: (data) => api.post('/api/symptoms/report', data),
  getMyReports: () => api.get('/api/symptoms/reports'),
  getReports: () => api.get('/api/symptoms/reports'),
  verifyReport: (id, data) => api.put(`/api/symptoms/reports/${id}/verify`, data),
  updateReport: (id, data) => api.put(`/api/symptoms/reports/${id}`, data),
  deleteReport: (id) => api.delete(`/api/symptoms/reports/${id}`),
}

// Medicines API
export const medicinesAPI = {
  search: (query, options = {}) => {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (options.symptom) params.append('symptom', options.symptom)
    if (options.disease) params.append('disease', options.disease)
    if (options.form) params.append('form', options.form)
    if (options.category) params.append('category', options.category)
    if (options.limit) params.append('limit', options.limit)
    return api.get(`/api/medicines/search?${params.toString()}`)
  },
  searchBySymptom: (symptom) => api.get(`/api/medicines/search?symptom=${encodeURIComponent(symptom)}`),
  searchByDisease: (disease) => api.get(`/api/medicines/search?disease=${encodeURIComponent(disease)}`),
  getDetails: (id) => api.get(`/api/medicines/${id}`),
  getAlternatives: (id) => api.get(`/api/medicines/${id}/alternatives`),
  getNearbyPharmacies: (lat, lng, radius = 10) =>
    api.get(`/api/medicines/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
}

// User Cart API
export const cartAPI = {
  getCart: () => api.get('/api/cart'),
  addToCart: (medicineId, quantity = 1) => api.post('/api/cart', { medicineId, quantity }),
  removeFromCart: (cartItemId) => api.delete(`/api/cart/${cartItemId}`),
  checkInCart: (medicineId) => api.get(`/api/cart/check/${medicineId}`),
}

// Rewards API
export const rewardsAPI = {
  getMyRewards: () => api.get('/api/rewards/me'),
  getLeaderboard: (limit = 50) => api.get('/api/rewards/leaderboard', { params: { limit } }),
  redeemGiftCard: (giftCardType) => api.post('/api/rewards/redeem', { giftCardType }),
  getRedemptions: () => api.get('/api/rewards/redemptions'),
  checkCertificateEligibility: () => api.get('/api/rewards/certificate/check'),
  claimCertificate: () => api.post('/api/rewards/certificate/claim'),
  getCertificate: () => api.get('/api/rewards/certificate'),
  downloadCertificate: () => api.get('/api/rewards/certificate/download', { responseType: 'blob' }),
}

export default api

