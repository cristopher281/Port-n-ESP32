import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Home as HomeIcon, Clock, Bell, Activity, Settings as SettingsIcon } from 'lucide-react'

// Pages
import Home from './pages/Home'
import History from './pages/History'
import Alerts from './pages/Alerts'
import RealTimeStatus from './pages/RealTimeStatus'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDevices from './pages/AdminDevices'

export default function App() {
  const location = useLocation()

  // Don't show bottom nav on settings page
  const showBottomNav = !location.pathname.includes('/settings') && !location.pathname.includes('/real-time')

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/real-time" element={<RealTimeStatus />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/devices" element={<AdminDevices />} />
      </Routes>

      {showBottomNav && <BottomNav />}
    </div>
  )
}

function BottomNav() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Inicio', icon: HomeIcon },
    { path: '/real-time', label: 'Estado', icon: Activity },
    { path: '/history', label: 'Historial', icon: Clock },
    { path: '/settings', label: 'Ajustes', icon: SettingsIcon }
  ]

  return (
    <nav className="glass-nav">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.path

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
