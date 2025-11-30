import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Shield } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations'
import '../styles/legal.css'

export default function Privacy() {
  const { language } = useLanguage()
  return (
    <div className="legal-page">
      <Navbar />
      <main className="legal-main">
        <div className="container">
          <div className="legal-header">
            <Shield size={48} className="legal-icon" />
            <h1>{t('privacyPolicy', language)}</h1>
            <p>{t('lastUpdated', language)}: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="legal-content">
            <section>
              <h2>1. {t('informationWeCollect', language)}</h2>
              <p>{t('informationWeCollectDesc', language)}</p>
              <ul>
                <li>{t('nameEmailForAccount', language)}</li>
                <li>{t('symptomReportsHealthInfo', language)}</li>
                <li>{t('locationData', language)}</li>
              </ul>
            </section>

            <section>
              <h2>2. {t('howWeUseInformation', language)}</h2>
              <p>{t('howWeUseInformationDesc', language)}</p>
              <ul>
                <li>{t('trackMonitorOutbreaks', language)}</li>
                <li>{t('provideHealthRiskAssessments', language)}</li>
                <li>{t('improveServices', language)}</li>
                <li>{t('complyWithLegalObligations', language)}</li>
              </ul>
            </section>

            <section>
              <h2>3. {t('dataSecurity', language)}</h2>
              <p>{t('dataSecurityDesc', language)}</p>
            </section>

            <section>
              <h2>4. {t('dpdp2023Compliance', language)}</h2>
              <p>{t('dpdp2023ComplianceDesc', language)}</p>
              <ul>
                <li>{t('accessPersonalData', language)}</li>
                <li>{t('rectifyInaccurateData', language)}</li>
                <li>{t('requestDeletion', language)}</li>
                <li>{t('dataPortability', language)}</li>
              </ul>
            </section>

            <section>
              <h2>5. {t('contactUs', language)}</h2>
              <p>{t('privacyContactDesc', language)}</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

