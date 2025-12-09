import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as doLogin, saveAuthToken } from '../services/auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await doLogin(username, password)
      saveAuthToken(res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="page">
      <div className="content">
        <form className="form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>
          <input
            className="form-input"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="form-input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="form-actions">
            <button className="btn btn-gold" type="submit">Ingresar</button>
          </div>

          {error && <div className="form-error">{error}</div>}
        </form>
      </div>
    </div>
  )
}
