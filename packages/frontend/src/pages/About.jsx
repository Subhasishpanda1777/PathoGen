import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Info, Activity, Shield, Pill, Users, Target, Heart } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations'
import '../styles/about.css'

export default function About() {
  const { language } = useLanguage()
  const containerRef = useRef(null)

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

  return (
    <div className="about-page" ref={containerRef}>
      <main className="about-main">
        <div className="container">
          <div className="about-header">
            <Info size={48} className="about-icon" />
            <h1>{t('aboutPathoGen', language)}</h1>
            <p>{t('empoweringCommunities', language)}</p>
          </div>

          <div className="about-content">
            <section className="about-section">
              <h2>{t('ourMission', language)}</h2>
              <p>
                PathoGen is a comprehensive health monitoring platform designed to help communities
                detect and respond to disease outbreaks early. We combine real-time symptom reporting,
                data analytics, and affordable medicine discovery to create a healthier future for everyone.
              </p>
            </section>

            <section className="about-section">
              <h2>What We Do</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <div className="feature-icon">
                      <Activity size={48} strokeWidth={2.5} color="#ffffff" />
                    </div>
                  </div>
                  <h3>Disease Tracking</h3>
                  <p>
                    Monitor and track disease outbreaks in real-time using community-reported symptoms
                    and advanced analytics.
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <div className="feature-icon">
                      <Pill size={48} strokeWidth={2.5} color="#ffffff" />
                    </div>
                  </div>
                  <h3>Affordable Medicines</h3>
                  <p>
                    Find affordable alternatives to expensive medicines through our comprehensive
                    medicine database and price comparison.
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <div className="feature-icon">
                      <Shield size={48} strokeWidth={2.5} color="#ffffff" />
                    </div>
                  </div>
                  <h3>Health Reporting</h3>
                  <p>
                    Submit symptom reports to help health authorities identify and respond to
                    potential outbreaks quickly.
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <div className="feature-icon">
                      <Users size={48} strokeWidth={2.5} color="#ffffff" />
                    </div>
                  </div>
                  <h3>Community Health</h3>
                  <p>
                    Build a healthier community by participating in collective health monitoring
                    and awareness programs.
                  </p>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>Our Values</h2>
              <div className="values-list">
                <div className="value-item">
                  <Target size={24} />
                  <div>
                    <h3>Accuracy</h3>
                    <p>We prioritize data accuracy and verified information in all our services.</p>
                  </div>
                </div>
                <div className="value-item">
                  <Heart size={24} />
                  <div>
                    <h3>Accessibility</h3>
                    <p>Healthcare should be accessible to everyone, regardless of their location or income.</p>
                  </div>
                </div>
                <div className="value-item">
                  <Shield size={24} />
                  <div>
                    <h3>Privacy</h3>
                    <p>Your health data is protected with industry-standard security measures.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>How It Works</h2>
              <div className="steps-list">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Report Symptoms</h3>
                    <p>Users report their symptoms through our easy-to-use reporting system.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Data Analysis</h3>
                    <p>Our system analyzes reports to identify patterns and potential outbreaks.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Early Warning</h3>
                    <p>Health authorities receive alerts about potential disease clusters.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h3>Community Response</h3>
                    <p>Communities can take preventive measures and access affordable healthcare.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>Contact Us</h2>
              <p>
                Have questions or feedback? We'd love to hear from you. Reach out to us through
                our support channels or visit our help center.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

