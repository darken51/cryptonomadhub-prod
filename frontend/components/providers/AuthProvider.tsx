'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { useToast } from './ToastProvider'
import { registerApiHandlers } from '@/lib/api'
import { analytics } from '@/lib/analytics'

interface LicenseInfo {
  tier: string
  status: string
  expires_at?: string | null
  next_billing_date?: string | null
}

interface User {
  id: number
  email: string
  role: string
  full_name?: string | null
  license?: LicenseInfo | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Internal component that monitors session expiration
function AuthSessionMonitor({ wasAuthenticated }: { wasAuthenticated: boolean }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const hasShownToast = useRef(false)

  useEffect(() => {
    // If user was authenticated but is now null, session expired
    if (wasAuthenticated && !user && !hasShownToast.current) {
      hasShownToast.current = true
      showToast('Votre session a expiré. Veuillez vous reconnecter.', 'error')
    }
  }, [user, wasAuthenticated, showToast])

  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [wasAuthenticated, setWasAuthenticated] = useState(false)
  const { showToast } = useToast()

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    if (storedToken) {
      setToken(storedToken)
      fetchUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  // Track when user becomes authenticated
  useEffect(() => {
    if (user) {
      setWasAuthenticated(true)

      // Identify user in analytics
      analytics.identify(user.id.toString(), {
        email: user.email,
        tier: user.license?.tier || 'FREE',
        status: user.license?.status || 'active',
      })
    }
  }, [user])

  const fetchUser = async (accessToken: string) => {
    try {
      const apiUrl = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : 'http://backend:8000';
    const response = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token invalid - clear everything and logout
        localStorage.removeItem('access_token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      // Network error - also clear auth state
      localStorage.removeItem('access_token')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const formData = new URLSearchParams()
    formData.append('username', email) // OAuth2 uses 'username' field
    formData.append('password', password)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      // Show the actual error message from backend (includes email verification warnings)
      throw new Error(error.detail || 'Login failed')
    }

    const data = await response.json()
    const accessToken = data.access_token

    localStorage.setItem('access_token', accessToken)
    setToken(accessToken)
    await fetchUser(accessToken)
  }

  const register = async (email: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Registration failed')
    }

    // Don't auto-login - user must verify email first
    // The registration success message will be shown by the calling component
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)

    // Reset analytics identity
    analytics.reset()
  }

  const refreshUser = async () => {
    if (token) {
      await fetchUser(token)
    }
  }

  // Register global API handlers for 401 error handling
  useEffect(() => {
    registerApiHandlers(logout, showToast)
  }, [showToast])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, isLoading }}>
      <AuthSessionMonitor wasAuthenticated={wasAuthenticated} />
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
