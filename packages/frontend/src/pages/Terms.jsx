import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { FileText } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations'
import '../styles/legal.css'

export default function Terms() {
  const { language } = useLanguage()
  return (
    <div className="legal-page">
      <Navbar />
      <main className="legal-main">
        <div className="container">
          <div className="legal-header">
            <FileText size={48} className="legal-icon" />
            <h1>{t('termsOfService', language)}</h1>
            <p>{t('lastUpdated', language)}: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="legal-content">
            <section>
              <h2>1. {t('acceptanceOfTerms', language)}</h2>
              <p>{t('acceptanceOfTermsDesc', language)}</p>
            </section>

            <section>
              <h2>2. {t('useOfService', language)}</h2>
              <p>{t('youAgreeTo', language)}:</p>
              <ul>
                <li>{t('provideAccurateInfo', language)}</li>
                <li>{t('useForLawfulPurposes', language)}</li>
                <li>{t('notMisusePlatform', language)}</li>
                <li>{t('respectPrivacy', language)}</li>
              </ul>
            </section>

            <section>
              <h2>3. {t('medicalDisclaimer', language)}</h2>
              <p>{t('medicalDisclaimerDesc', language)}</p>
            </section>

            <section>
              <h2>4. {t('limitationOfLiability', language)}</h2>
              <p>{t('limitationOfLiabilityDesc', language)}</p>
            </section>

            <section>
              <h2>5. {t('changesToTerms', language)}</h2>
              <p>{t('changesToTermsDesc', language)}</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

