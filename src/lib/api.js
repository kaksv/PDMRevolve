const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

export async function getEducationModule(code) {
  const response = await fetch(`${API_BASE}/api/education/modules/${encodeURIComponent(code)}`)
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

export const api = {
  getHealth: () => request('/api/health'),
  getDashboard: () => request('/api/dashboard'),
  getRepayments: () => request('/api/repayments'),
  getEducationModules: () => request('/api/education/modules'),
  getEducationModule,
}
