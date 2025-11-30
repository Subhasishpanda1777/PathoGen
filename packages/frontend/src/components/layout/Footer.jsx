import { Link } from 'react-router-dom'
import { Activity, Mail, Phone, MapPin, Shield, FileText } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { t } from '../../translations'
import '../../styles/footer.css'

export default function Footer() {
  const { language } = useLanguage()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <Activity size={20} />
              </div>
              <span className="footer-logo-text">PathoGen</span>
            </div>
            <p className="footer-description">
              {t('pathoGenDescription', language)}
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-heading">{t('quickLinks', language)}</h3>
            <ul className="footer-links">
              <li><Link to="/">{t('home', language)}</Link></li>
              <li><Link to="/dashboard">{t('dashboard', language)}</Link></li>
              <li><Link to="/medicines">{t('medicines', language)}</Link></li>
              <li><Link to="/report">{t('reportSymptomsLink', language)}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h3 className="footer-heading">{t('legal', language)}</h3>
            <ul className="footer-links">
              <li>
                <Link to="/privacy">
                  <Shield size={16} />
                  <span>{t('privacyPolicy', language)}</span>
                </Link>
              </li>
              <li>
                <Link to="/terms">
                  <FileText size={16} />
                  <span>{t('termsOfService', language)}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-heading">{t('contact', language)}</h3>
            <ul className="footer-contact">
              <li>
                <Mail size={16} />
                <span>PathoGen.co.int.in@gmail.com</span>
              </li>
              <li>
                <Phone size={16} />
                <span>+91-7205421066</span>
              </li>
              <li>
                <MapPin size={16} />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} PathoGen. {t('allRightsReserved', language)}</p>
          <p className="footer-compliance">
            <Shield size={16} />
            <span>{t('dpdpCompliant', language)}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

