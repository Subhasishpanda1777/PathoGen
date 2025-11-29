import { Link } from 'react-router-dom'
import { Activity, Mail, Phone, MapPin, Shield, FileText } from 'lucide-react'
import '../../styles/footer.css'

export default function Footer() {
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
              Public Health Monitoring Platform for India. Track outbreaks, find affordable medicines, and contribute to community health.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/medicines">Medicines</Link></li>
              <li><Link to="/report">Report Symptoms</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h3 className="footer-heading">Legal</h3>
            <ul className="footer-links">
              <li>
                <Link to="/privacy">
                  <Shield size={16} />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms">
                  <FileText size={16} />
                  <span>Terms of Service</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-heading">Contact</h3>
            <ul className="footer-contact">
              <li>
                <Mail size={16} />
                <span>support@pathogen.in</span>
              </li>
              <li>
                <Phone size={16} />
                <span>+91-XXXX-XXXXXX</span>
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
          <p>© {new Date().getFullYear()} PathoGen. All rights reserved.</p>
          <p className="footer-compliance">
            <Shield size={16} />
            <span>DPDP 2023 Compliant</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

