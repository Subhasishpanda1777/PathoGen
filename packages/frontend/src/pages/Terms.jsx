import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { FileText } from 'lucide-react'
import '../styles/legal.css'

export default function Terms() {
  return (
    <div className="legal-page">
      <Navbar />
      <main className="legal-main">
        <div className="container">
          <div className="legal-header">
            <FileText size={48} className="legal-icon" />
            <h1>Terms of Service</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="legal-content">
            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing and using PathoGen, you accept and agree to be bound by these Terms of Service.</p>
            </section>

            <section>
              <h2>2. Use of Service</h2>
              <p>You agree to:</p>
              <ul>
                <li>Provide accurate and truthful information</li>
                <li>Use the service for lawful purposes only</li>
                <li>Not misuse or abuse the platform</li>
                <li>Respect the privacy of other users</li>
              </ul>
            </section>

            <section>
              <h2>3. Medical Disclaimer</h2>
              <p>PathoGen is a public health monitoring platform and does not provide medical advice. Always consult healthcare professionals for medical concerns.</p>
            </section>

            <section>
              <h2>4. Limitation of Liability</h2>
              <p>PathoGen is not liable for any indirect, incidental, or consequential damages arising from use of the platform.</p>
            </section>

            <section>
              <h2>5. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance of changes.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

