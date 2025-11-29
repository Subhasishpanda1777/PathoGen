import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { Activity, Mail, Lock, ArrowRight, Shield, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { authAPI } from '../utils/api'
import '../styles/auth.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef(null)
  const from = location.state?.from?.pathname || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

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

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      await authAPI.login({ email, password })
      await authAPI.sendOTP({ email })
      setOtpSent(true)
      setSuccess('OTP sent to your email!')
      
      if (containerRef.current) {
        gsap.from(containerRef.current.querySelector('.otp-form'), {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          ease: 'back.out(1.7)',
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
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

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await authAPI.verifyOTP({ email, otp })
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        gsap.to(containerRef.current, {
          scale: 1.05,
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            navigate(from, { replace: true })
          },
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
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
            <div className="auth-logo">
              <Activity size={32} />
            </div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to access your health dashboard</p>
          </div>

          {/* Login Card - Neumorphism */}
          <div className="auth-card">
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <CheckCircle size={20} />
                <span>{success}</span>
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="auth-form">
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={18} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
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
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="auth-form otp-form">
                <div className="otp-info">
                  <p>OTP sent to</p>
                  <p className="otp-email">{email}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    className="input input-otp"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn btn-primary btn-block"
                >
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Login</span>
                      <CheckCircle size={18} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false)
                    setOtp('')
                    setError(null)
                    setSuccess(null)
                  }}
                  className="btn btn-neumorphic btn-block"
                >
                  Change Email
                </button>
              </form>
            )}

            <div className="auth-footer">
              <Shield size={16} />
              <span>Your data is encrypted (AES-256) and DPDP 2023 compliant</span>
            </div>

            <div className="auth-link">
              Don't have an account? <Link to="/register">Register here</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

