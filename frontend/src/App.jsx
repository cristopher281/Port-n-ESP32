import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Dashboard from './features/dashboard/Dashboard'

export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>ESP32 IoT Dashboard</h1>
        <nav>
          <Link to="/">Dashboard</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}
