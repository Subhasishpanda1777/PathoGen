import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'
import DistrictPopup from '../DistrictPopup'
import '../../styles/dashboard-layout.css'

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Appbar */}
      <div className="dashboard-mobile-appbar">
        <button
          className="dashboard-mobile-menu-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          aria-expanded={isSidebarOpen}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="dashboard-mobile-logo">
          <span>PathoGen</span>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <main className="dashboard-content">
        {children || <Outlet />}
      </main>
      <DistrictPopup />
    </div>
  )
}

