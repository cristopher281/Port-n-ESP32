import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/auth'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      await register(username, password)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Register failed')
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Registrar usuario</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
        <input placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Contraseña (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Crear cuenta</button>
        {error && <div style={{ color: 'salmon' }}>{error}</div>}
      </form>
    </div>
  )
}
