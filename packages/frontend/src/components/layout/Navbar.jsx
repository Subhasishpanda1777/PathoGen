import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Activity, Menu, X } from 'lucide-react'
import LanguageSelector from '../LanguageSelector'
import '../../styles/navbar.css'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/medicines', label: 'Medicines' },
  { href: '/report', label: 'Report' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">
              <Activity size={24} />
            </div>
            <span className="navbar-logo-text">PathoGen</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-links">
            {navLinks.map((link) => {
              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === '/'}
                  className={({ isActive }) => 
                    `navbar-link ${isActive ? 'navbar-link-active' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="navbar-actions">
            <LanguageSelector />
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
          </div>

          {/* Mobile Menu Button - Only visible on small devices */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="navbar-mobile-toggle"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Only visible on small devices */}
      {isMobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <div className="container">
            {navLinks.map((link) => {
              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    `navbar-mobile-link ${isActive ? 'navbar-mobile-link-active' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              )
            })}
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn btn-primary navbar-mobile-login"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

