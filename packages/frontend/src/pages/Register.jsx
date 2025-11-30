import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { Activity, Mail, Lock, User, ArrowRight, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { authAPI } from '../utils/api'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations'
import '../styles/auth.css'

export default function Register() {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef(null)
  const from = location.state?.from?.pathname || '/dashboard'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError(null)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch', language))
      return
    }

    if (formData.password.length < 6) {
      setError(t('passwordMustBeAtLeast', language))
      return
    }

    setLoading(true)

    try {
      // Register endpoint now sends OTP automatically, no need to call sendOTP separately
      await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      setOtpSent(true)
      setSuccess(t('accountCreated', language))

      if (containerRef.current) {
        gsap.from(containerRef.current.querySelector('.otp-form'), {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          ease: 'back.out(1.7)',
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || t('registrationFailed', language))
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
      const response = await authAPI.verifyOTP({ email: formData.email, otp })
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
          <div className="auth-header">
            <div className="auth-logo">
              <Activity size={32} />
            </div>
            <h1 className="auth-title">{t('createAccount', language)}</h1>
            <p className="auth-subtitle">{t('joinPathoGen', language)}</p>
          </div>

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
              <form onSubmit={handleRegister} className="auth-form">
                <div className="form-group">
                  <label className="form-label">
                    <User size={18} />
                    {t('fullName', language)}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('enterYourName', language)}
                    required
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Mail size={18} />
                    {t('emailAddress', language)}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('atLeast6Characters', language)}
                    required
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock size={18} />
                    {t('confirmPassword', language)}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={t('reEnterPassword', language)}
                    required
                    className="input"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-block">
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      <span>{t('creatingAccount', language)}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('createAccount', language)}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="auth-form otp-form">
                <div className="otp-info">
                  <p>{t('otpSentTo', language)}</p>
                  <p className="otp-email">{formData.email}</p>
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
                      <span>{t('verifyAndComplete', language)}</span>
                      <CheckCircle size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="auth-footer">
              <Shield size={16} />
              <span>{t('dataEncrypted', language)}</span>
            </div>

            <div className="auth-link">
              {t('alreadyHaveAccount', language)} <Link to="/login">{t('loginHere', language)}</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

