import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Home as HomeIcon, Clock, Bell, Activity, Settings as SettingsIcon } from 'lucide-react'

// Pages
import Home from './pages/Home'
import History from './pages/History'
import Alerts from './pages/Alerts'
import RealTimeStatus from './pages/RealTimeStatus'
import Settings from './pages/Settings'

export default function App() {
  const location = useLocation()

  // Don't show bottom nav on settings page
  const showBottomNav = !location.pathname.includes('/settings') && !location.pathname.includes('/real-time')

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/real-time" element={<RealTimeStatus />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>

      {showBottomNav && <BottomNav />}
    </div>
  )
}

function BottomNav() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Inicio', icon: HomeIcon },
    { path: '/history', label: 'Historial', icon: Clock },
    { path: '/alerts', label: 'Accesos', icon: Bell },
    { path: '/real-time', label: 'Perfil', icon: Activity }
  ]

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.path

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={24} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
