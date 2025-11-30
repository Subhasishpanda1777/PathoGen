import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { Activity, Mail, Lock, ArrowRight, Shield, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { authAPI } from '../utils/api'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations'
import '../styles/auth.css'

export default function Login() {
  const { language } = useLanguage()
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
      // Login endpoint already sends OTP, no need to call sendOTP separately
      await authAPI.login({ email, password })
      setOtpSent(true)
      setSuccess(t('otpSentToEmail', language))
      
      if (containerRef.current) {
        gsap.from(containerRef.current.querySelector('.otp-form'), {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          ease: 'back.out(1.7)',
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || t('failedToSendOTP', language))
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
      setError(err.response?.data?.message || t('invalidOTP', language))
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
            <h1 className="auth-title">{t('welcomeBack', language)}</h1>
            <p className="auth-subtitle">{t('signInToAccess', language)}</p>
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
                    {t('emailAddress', language)}
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
                    {t('password', language)}
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('enterYourPassword', language)}
                      required
                      className="input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle-btn"
                      aria-label={showPassword ? t('hidePassword', language) : t('showPassword', language)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-block">
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      <span>{t('sendingOTP', language)}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('sendOTP', language)}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="auth-form otp-form">
                <div className="otp-info">
                  <p>{t('otpSentTo', language)}</p>
                  <p className="otp-email">{email}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('enter6DigitOTP', language)}</label>
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
                      <span>{t('verifying', language)}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('verifyAndLogin', language)}</span>
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
                  {t('changeEmail', language)}
                </button>
              </form>
            )}

            <div className="auth-footer">
              <Shield size={16} />
              <span>{t('dataEncrypted', language)}</span>
            </div>

            <div className="auth-link">
              {t('dontHaveAccount', language)} <Link to="/register">{t('registerHere', language)}</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

