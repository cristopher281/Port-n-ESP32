import api from './api'

export async function register(username, password) {
  const res = await api.post('/auth/register', { username, password })
  return res.data
}

export async function login(username, password) {
  const res = await api.post('/auth/login', { username, password })
  return res.data
}

export function saveAuthToken(token) {
  try { localStorage.setItem('auth_token', token) } catch (e) {}
}

export function clearAuthToken() {
  try { localStorage.removeItem('auth_token') } catch (e) {}
}

export function getAuthToken() {
  try { return localStorage.getItem('auth_token') } catch (e) { return null }
}
