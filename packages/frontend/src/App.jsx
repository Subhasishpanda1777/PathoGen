import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Report from './pages/Report'
import Medicines from './pages/Medicines'
import Cart from './pages/Cart'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import About from './pages/About'
import Profile from './pages/Profile'
import PreventionMeasures from './pages/PreventionMeasures'
import Rewards from './pages/Rewards'
import ReportsRouter from './components/ReportsRouter'
import AdminPanel from './admin/AdminPanel'
import AdminDashboard from './admin/AdminDashboard'
import AdminMedicines from './admin/AdminMedicines'
import AdminSymptoms from './admin/AdminSymptoms'
import AdminLogin from './admin/AdminLogin'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        
        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes - Nested under /admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="reports" element={<AdminPanel />} />
          <Route path="medicines" element={<AdminMedicines />} />
          <Route path="symptoms" element={<AdminSymptoms />} />
        </Route>

        {/* Protected Routes with Dashboard Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="reports" element={<ReportsRouter />} />
        </Route>
        
        {/* Protected Routes - Report */}
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Report />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes - Prevention Measures */}
        <Route
          path="/prevention-measures"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PreventionMeasures />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes - Rewards */}
        <Route
          path="/rewards"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Rewards />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes - Medicines */}
        <Route
          path="/medicines"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Medicines />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes - Cart */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Cart />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes - About Us */}
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <About />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
