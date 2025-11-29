import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { Shield, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { adminAPI } from '../utils/api'
import '../styles/auth.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      })
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await adminAPI.login({ email, password })
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        gsap.to(containerRef.current, {
          scale: 1.05,
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            navigate('/admin/dashboard', { replace: true })
          },
        })
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.'
      setError(errorMessage)
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          x: [-10, 10, -10, 10, 0],
          duration: 0.3,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-main">
        <div ref={containerRef} className="auth-container">
          {/* Logo & Header */}
          <div className="auth-header">
            <div className="auth-logo" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <Shield size={32} />
            </div>
            <h1 className="auth-title">Admin Login</h1>
            <p className="auth-subtitle">Secure access to admin panel</p>
          </div>

          {/* Login Card - Neumorphism */}
          <div className="auth-card">
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label">
                  <Mail size={18} />
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pathogen.com"
                  required
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={18} />
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-block">
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <Shield size={16} />
              <span>Admin access is logged and monitored for security</span>
            </div>

            <div className="auth-link">
              Not an admin? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Regular login</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
