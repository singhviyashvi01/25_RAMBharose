/**
 * SERVICE: api.js
 * Purpose: Axios base instance configured with backend URL and auth headers.
 * All other service files import from this.
 */
import axios from 'axios'
import { supabase } from './supabaseClient'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach Supabase JWT token to every request
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
