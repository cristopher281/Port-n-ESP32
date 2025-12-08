import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || ''
const DEVICE_ID = import.meta.env.VITE_DEVICE_ID || '1'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
})

// Add admin/user authorization for protected endpoints
const getAuthHeaders = () => {
  // Prefer user JWT stored in localStorage
  try {
    const token = localStorage.getItem('auth_token')
    if (token) return { Authorization: `Bearer ${token}` }
  } catch (e) {
    // ignore
  }

  // Fallback to admin secret for local testing
  if (ADMIN_SECRET) return { Authorization: `Bearer ${ADMIN_SECRET}` }

  return {}
}

// Simple interceptor to forward errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.response?.data || err.message)
    return Promise.reject(err)
  }
)

// ============================================
// DEVICE ENDPOINTS
// ============================================

/**
 * Get all devices
 */
export const getDevices = async () => {
  const response = await api.get('/devices')
  return response.data
}

/**
 * Get device by ID
 */
export const getDevice = async (deviceId = DEVICE_ID) => {
  const response = await api.get(`/devices/${deviceId}`)
  return response.data
}

/**
 * Get device state (open/closed/unknown)
 */
export const getDeviceState = async (deviceId = DEVICE_ID) => {
  const response = await api.get(`/devices/${deviceId}/state`)
  return response.data
}

/**
 * Send command to device (requires admin secret)
 * @param {string} command - 'open' or 'close'
 * @param {object} payload - Optional additional data
 */
export const sendCommand = async (command, payload = null, deviceId = DEVICE_ID) => {
  const response = await api.post(`/devices/${deviceId}/command`, { command, payload }, { headers: getAuthHeaders() })
  return response.data
}

// ============================================
// SENSOR ENDPOINTS
// ============================================

/**
 * Get latest reading for a specific sensor type
 */
export const getLatestReading = async (deviceId = DEVICE_ID, sensorType = null) => {
  const params = sensorType ? { sensor_type: sensorType } : {}
  const response = await api.get(`/sensors/latest/${deviceId}`, { params })
  return response.data
}

/**
 * Get all latest readings (one per sensor type)
 */
export const getAllLatestReadings = async (deviceId = DEVICE_ID) => {
  const response = await api.get(`/sensors/all-latest/${deviceId}`)
  return response.data
}

/**
 * Get historical sensor readings
 * @param {object} options - { limit, offset, sensor_type, start_date, end_date }
 */
export const getHistory = async (deviceId = DEVICE_ID, options = {}) => {
  const params = {
    limit: options.limit || 100,
    offset: options.offset || 0,
    ...(options.sensor_type && { sensor_type: options.sensor_type }),
    ...(options.start_date && { start_date: options.start_date }),
    ...(options.end_date && { end_date: options.end_date })
  }
  const response = await api.get(`/sensors/history/${deviceId}`, { params })
  return response.data
}

/**
 * Get device statistics
 * @param {string} sensorType - Type of sensor
 * @param {number} hours - Hours to look back (default: 24)
 */
export const getDeviceStats = async (sensorType, hours = 24, deviceId = DEVICE_ID) => {
  const response = await api.get(`/sensors/stats/${deviceId}`, {
    params: { sensor_type: sensorType, hours }
  })
  return response.data
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format sensor data for UI display
 */
export const formatSensorValue = (value, unit) => {
  if (unit === 'boolean') return value ? 'Sí' : 'No'
  if (unit === '%') return `${value}%`
  if (unit === '°C') return `${value}°C`
  return `${value} ${unit || ''}`
}

/**
 * Parse backend timestamp to readable format
 */
export const parseTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default api
