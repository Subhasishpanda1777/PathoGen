import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Shield } from 'lucide-react'
import '../styles/legal.css'

export default function Privacy() {
  return (
    <div className="legal-page">
      <Navbar />
      <main className="legal-main">
        <div className="container">
          <div className="legal-header">
            <Shield size={48} className="legal-icon" />
            <h1>Privacy Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="legal-content">
            <section>
              <h2>1. Information We Collect</h2>
              <p>We collect information that you provide directly to us, including:</p>
              <ul>
                <li>Name and email address for account creation</li>
                <li>Symptom reports and health information</li>
                <li>Location data (state, district, city)</li>
              </ul>
            </section>

            <section>
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Track and monitor disease outbreaks</li>
                <li>Provide personalized health risk assessments</li>
                <li>Improve our services and platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2>3. Data Security</h2>
              <p>We implement AES-256-GCM encryption to protect your data. All sensitive information is encrypted at rest and in transit.</p>
            </section>

            <section>
              <h2>4. DPDP 2023 Compliance</h2>
              <p>PathoGen complies with the Digital Personal Data Protection Act, 2023 (DPDP Act). You have the right to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Rectify inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h2>5. Contact Us</h2>
              <p>For privacy-related inquiries, contact us at: privacy@pathogen.in</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

