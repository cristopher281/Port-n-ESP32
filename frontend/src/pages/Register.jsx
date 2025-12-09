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
    <div className="page">
      <div className="content">
        <form className="form" onSubmit={handleSubmit}>
          <h2>Registrar usuario</h2>
          <input
            className="form-input"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="form-input"
            type="password"
            placeholder="Contraseña (min 6)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="form-actions">
            <button className="btn btn-gold" type="submit">Crear cuenta</button>
          </div>

          {error && <div className="form-error">{error}</div>}
        </form>
      </div>
    </div>
  )
}
