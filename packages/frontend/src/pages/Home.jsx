import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import {
  Activity,
  TrendingUp,
  Shield,
  Pill,
  ArrowRight,
  CheckCircle,
  BarChart3,
} from 'lucide-react'
import { dashboardAPI } from '../utils/api'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations'
import '../styles/home.css'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const { language } = useLanguage()
  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const featuresRef = useRef(null)
  const [stats, setStats] = useState({ activeOutbreaks: 0, recentReports: 0, trendingDiseasesCount: 0 })

  useEffect(() => {
    // Load stats
    dashboardAPI.getStats()
      .then((res) => setStats(res.data.stats))
      .catch((err) => {
        console.error('Failed to load stats:', err)
        // Set default stats if API fails
        setStats({ activeOutbreaks: 0, recentReports: 0, trendingDiseasesCount: 0 })
      })

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      // GSAP Animations
      if (heroRef.current) {
        const items = heroRef.current.querySelectorAll('.hero-item')
        if (items.length > 0) {
          gsap.from(items, {
            y: 30,
            opacity: 0.3,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            onComplete: () => {
              items.forEach(item => {
                item.style.opacity = '1'
                item.style.visibility = 'visible'
              })
            }
          })
        }
      }

      // Stats animations
      if (statsRef.current) {
        const cards = statsRef.current.querySelectorAll('.stat-card')
        if (cards.length > 0) {
          gsap.from(cards, {
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 90%',
            },
            y: 20,
            opacity: 0.5,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            onComplete: () => {
              cards.forEach(card => {
                card.style.opacity = '1'
                card.style.visibility = 'visible'
              })
            }
          })
        }
      }

      // Features animations
      if (featuresRef.current) {
        const featureCards = featuresRef.current.querySelectorAll('.feature-card')
        if (featureCards.length > 0) {
          gsap.from(featureCards, {
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 90%',
            },
            y: 30,
            opacity: 0.5,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out',
            onComplete: () => {
              featureCards.forEach(card => {
                card.style.opacity = '1'
                card.style.visibility = 'visible'
              })
            }
          })
        }
      }
    }, 100)

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  const features = [
    {
      icon: TrendingUp,
      title: t('realTimeOutbreakTracking', language),
      description: t('realTimeOutbreakTrackingDesc', language),
    },
    {
      icon: Pill,
      title: t('affordableMedicineFinder', language),
      description: t('affordableMedicineFinderDesc', language),
    },
    {
      icon: Shield,
      title: t('symptomReporting', language),
      description: t('symptomReportingDesc', language),
    },
    {
      icon: BarChart3,
      title: t('healthAnalytics', language),
      description: t('healthAnalyticsDesc', language),
    },
  ]

  const benefits = [
    t('freeAndAccessible', language),
    t('privacyProtected', language),
    t('dpdpCompliant', language),
    t('realTimeHealthInsights', language),
  ]

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="hero-section">
        <div className="container">
          <div className="hero-content">
            {/* Badge */}
            <div className="hero-badge hero-item">
              <Shield size={16} />
              <span>{t('dpdpCompliant', language)} • {t('privacyProtected', language)}</span>
            </div>

            {/* Main Heading */}
            <h1 className="hero-title hero-item">
              {t('trackOutbreaks', language)}
              <br />
              {t('findMedicinesTitle', language)}
              <br />
              <span className="hero-title-highlight">{t('saveLives', language)}</span>
            </h1>

            <p className="hero-description hero-item">
              {t('pathoGenDescription', language)}
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta hero-item">
              <Link to="/login" className="btn btn-primary btn-large">
                <span>{t('getStarted', language)}</span>
                <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="btn btn-neumorphic btn-large">
                <Shield size={20} />
                <span>{t('reportSymptomsBtn', language)}</span>
              </Link>
            </div>

            {/* Live Stats */}
            <div ref={statsRef} className="hero-stats">
              <div className="stat-card">
                <div className="stat-value">{stats.activeOutbreaks || 0}</div>
                <div className="stat-label">{t('activeOutbreaks', language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value stat-value-success">{stats.recentReports || 0}</div>
                <div className="stat-label">{t('recentReports', language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value stat-value-warning">{stats.trendingDiseasesCount || 0}</div>
                <div className="stat-label">{t('trendingDiseases', language)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('everythingYouNeed', language)}</h2>
            <p>{t('comprehensiveTools', language)}</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon-wrapper">
                    <div className="feature-icon">
                      <Icon size={48} strokeWidth={2.5} color="#ffffff" />
                    </div>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('whyChoosePathoGen', language)}</h2>
          </div>

          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <CheckCircle size={24} className="benefit-icon" />
                <p className="benefit-text">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">{t('readyToMakeDifference', language)}</h2>
            <p className="cta-description">
              {t('joinThousands', language)}
            </p>
            <div className="cta-buttons">
              <Link to="/login" className="btn btn-glass btn-large">
                <span>{t('getStarted', language)}</span>
                <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="btn btn-neumorphic btn-large">
                {t('reportSymptomsBtn', language)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

