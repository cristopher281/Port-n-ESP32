import React, { useEffect, useState, useRef } from 'react'
import api from '../../services/api'

const deviceId = 1 // asumimos dispositivo 1 para demo; ajustar según sea necesario

export default function Dashboard() {
  const [state, setState] = useState('unknown')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const holdTimer = useRef(null)

  async function fetchState() {
    try {
      const res = await api.get(`/devices/${deviceId}/state`)
      const s = res.data.data && res.data.data.state ? res.data.data.state : 'unknown'
      setState(s === 'open' ? 'open' : s === 'closed' ? 'closed' : 'unknown')
    } catch (err) {
      console.error('State fetch error', err)
      setState('unknown')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, 5000)
    return () => clearInterval(interval)
  }, [])

  // Send command to backend (open or close)
  async function sendCommand(command) {
    setSending(true)
    try {
      // admin secret read from env (set in local .env)
      const adminSecret = import.meta.env.VITE_ADMIN_SECRET || ''
      await api.post(`/devices/${deviceId}/command`, { command }, {
        headers: {
          Authorization: `Bearer ${adminSecret}`
        }
      })
      // optimistically set state until device acknowledges
      setState(command === 'open' ? 'open' : 'closed')
    } catch (err) {
      console.error('Send command error', err)
    } finally {
      setSending(false)
    }
  }

  function handlePressStart() {
    // require hold of 600ms to trigger action
    holdTimer.current = setTimeout(() => {
      const next = state === 'open' ? 'close' : 'open'
      sendCommand(next === 'open' ? 'open' : 'close')
    }, 600)
  }

  function handlePressEnd() {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
  }

  return (
    <div className="dashboard-screen">
      <header className="topbar">
        <button className="menu-btn" aria-label="menu">☰</button>
        <h1 className="title">Mi Portón</h1>
        <button className="settings-btn" aria-label="settings">⚙️</button>
      </header>

      <section className="status-area">
        <div className="lock-icon">🔒</div>
        <div className="status-text">
          {loading ? 'Cargando...' : state === 'open' ? 'Abierto' : state === 'closed' ? 'Cerrado' : 'Desconocido'}
        </div>
      </section>

      <section className="control-area">
        <div
          className={`power-button ${state === 'open' ? 'on' : ''}`}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
        >
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ffd400" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v10" />
            <path d="M5.5 6.5a8.5 8.5 0 1 0 13 0" />
          </svg>
        </div>
        <div className="hint">Mantén presionado para operar</div>
      </section>

      <nav className="bottom-nav">
        <div className="nav-item">Inicio</div>
        <div className="nav-item">Historial</div>
        <div className="nav-item">Accesos</div>
        <div className="nav-item">Perfil</div>
      </nav>
    </div>
  )
}
