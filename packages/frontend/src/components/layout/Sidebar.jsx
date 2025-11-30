import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Pill,
  FileText,
  User,
  Settings,
  LogOut,
  Activity,
  Shield,
  Info,
  ShoppingCart,
  Trophy,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { authAPI } from '../../utils/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { t } from '../../translations'
import '../../styles/sidebar.css'

const getMenuItems = (isAdmin, lang) => {
  if (isAdmin) {
    return [
      { icon: Shield, label: t('dashboard', lang), path: '/admin/dashboard', adminOnly: true },
      { icon: FileText, label: t('reportHistory', lang), path: '/admin/reports', adminOnly: true },
      { icon: Pill, label: t('medicines', lang), path: '/admin/medicines', adminOnly: true },
      { icon: Activity, label: t('manageSymptoms', lang), path: '/admin/symptoms', adminOnly: true },
    ]
  }
  return [
    { icon: LayoutDashboard, label: t('dashboard', lang), path: '/dashboard' },
    { icon: FileText, label: t('reportSubmit', lang), path: '/report' },
    { icon: Shield, label: t('preventionMeasures', lang), path: '/prevention-measures' },
    { icon: FileText, label: t('reportHistory', lang), path: '/dashboard/reports' },
    { icon: Pill, label: t('medicines', lang), path: '/medicines' },
    { icon: Trophy, label: t('rewards', lang), path: '/rewards' },
    { icon: ShoppingCart, label: t('myCart', lang), path: '/cart' },
    { icon: Info, label: t('aboutUs', lang), path: '/about' },
  ]
}

export default function Sidebar({ isOpen = false, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const [user, setUser] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      setUser(response.data.user || response.data)
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/'
    }
    if (path === '/dashboard/reports') {
      return location.pathname === '/dashboard/reports' || location.pathname.startsWith('/dashboard/reports')
    }
    if (path === '/about') {
      return location.pathname === '/about'
    }
    if (path === '/medicines') {
      return location.pathname === '/medicines'
    }
    if (path === '/rewards') {
      return location.pathname === '/rewards'
    }
    if (path === '/cart') {
      return location.pathname === '/cart'
    }
    if (path === '/report') {
      return location.pathname === '/report'
    }
    if (path === '/prevention-measures') {
      return location.pathname === '/prevention-measures'
    }
    return location.pathname.startsWith(path)
  }

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Activity size={24} />
          </div>
          <span className="sidebar-logo-text">PathoGen</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {getMenuItems(user?.role === 'admin', language).map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`sidebar-nav-item ${active ? 'active' : ''} ${item.adminOnly ? 'admin-item' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {item.adminOnly && (
                <span className="admin-badge">Admin</span>
              )}
            </Link>
          )
        })}
      </nav>


      <div className="sidebar-footer">
        <div className="user-profile-section">
          <button
            className="user-profile-button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-email">{user?.email || 'user@email.com'}</span>
            </div>
            <Settings size={18} />
          </button>

          {showProfileMenu && (
            <div className="profile-menu">
              <Link
                to="/dashboard/profile"
                className="profile-menu-item"
                onClick={() => {
                  setShowProfileMenu(false)
                  if (onClose) onClose()
                }}
              >
                <User size={18} />
                <span>{t('profile', language)}</span>
              </Link>
              <button className="profile-menu-item logout" onClick={handleLogout}>
                <LogOut size={18} />
                <span>{t('logout', language)}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

