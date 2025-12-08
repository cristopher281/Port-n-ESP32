import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
})

// Simple interceptor to forward errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject(err)
  }
)

export default api
