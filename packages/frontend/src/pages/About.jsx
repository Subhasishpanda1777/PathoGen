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
              <p>{t('ourMissionDescription', language)}</p>
            </section>

            <section className="about-section">
              <h2>{t('whatWeDo', language)}</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <div className="feature-icon">
                      <Activity size={48} strokeWidth={2.5} color="#ffffff" />
                    </div>
                  </div>
                  <h3>{t('diseaseTracking', language)}</h3>
                  <p>{t('diseaseTrackingDesc', language)}</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <div className="feature-icon">
                      <Pill size={48} strokeWidth={2.5} color="#ffffff" />
                    </div>
                  </div>
                  <h3>{t('affordableMedicines', language)}</h3>
                  <p>{t('affordableMedicinesDesc', language)}</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <div className="feature-icon">
                      <Shield size={48} strokeWidth={2.5} color="#ffffff" />
                    </div>
                  </div>
                  <h3>{t('healthReporting', language)}</h3>
                  <p>{t('healthReportingDesc', language)}</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <div className="feature-icon">
                      <Users size={48} strokeWidth={2.5} color="#ffffff" />
                    </div>
                  </div>
                  <h3>{t('communityHealth', language)}</h3>
                  <p>{t('communityHealthDesc', language)}</p>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>{t('ourValues', language)}</h2>
              <div className="values-list">
                <div className="value-item">
                  <Target size={24} />
                  <div>
                    <h3>{t('accuracy', language)}</h3>
                    <p>{t('accuracyDescription', language)}</p>
                  </div>
                </div>
                <div className="value-item">
                  <Heart size={24} />
                  <div>
                    <h3>{t('accessibility', language)}</h3>
                    <p>{t('accessibilityDescription', language)}</p>
                  </div>
                </div>
                <div className="value-item">
                  <Shield size={24} />
                  <div>
                    <h3>{t('privacy', language)}</h3>
                    <p>{t('privacyDescription', language)}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>{t('howItWorks', language)}</h2>
              <div className="steps-list">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>{t('reportSymptoms', language)}</h3>
                    <p>{t('reportSymptomsStepDesc', language)}</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>{t('dataAnalysis', language)}</h3>
                    <p>{t('dataAnalysisStepDesc', language)}</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>{t('earlyWarning', language)}</h3>
                    <p>{t('earlyWarningStepDesc', language)}</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h3>{t('communityResponse', language)}</h3>
                    <p>{t('communityResponseStepDesc', language)}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>{t('contactUs', language)}</h2>
              <p>{t('contactUsDescription', language)}</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

