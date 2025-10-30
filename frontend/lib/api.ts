/**
 * Centralized API client with automatic 401 handling
 * Wraps fetch() to provide consistent error handling and session management
 */

let globalLogoutHandler: (() => void) | null = null
let globalToastHandler: ((message: string, type: 'error' | 'success' | 'info') => void) | null = null

/**
 * Register handlers for logout and toast notifications
 * Should be called once from AuthProvider
 */
export function registerApiHandlers(
  logout: () => void,
  showToast: (message: string, type: 'error' | 'success' | 'info') => void
) {
  globalLogoutHandler = logout
  globalToastHandler = showToast
}

/**
 * Enhanced fetch wrapper that handles authentication and errors
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  // Automatically add Authorization header if token exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const headers = new Headers(options.headers)

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Make the request
  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized - session expired
  if (response.status === 401) {
    // Clear token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
    }

    // Trigger logout and show toast
    if (globalLogoutHandler) {
      globalLogoutHandler()
    }
    if (globalToastHandler) {
      globalToastHandler('Votre session a expiré. Veuillez vous reconnecter.', 'error')
    }

    // Throw error to let caller handle it
    throw new Error('Session expired')
  }

  return response
}

/**
 * Convenience method for JSON requests
 */
export async function apiJson<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiFetch(endpoint, options)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `Request failed with status ${response.status}`)
  }

  return response.json()
}
