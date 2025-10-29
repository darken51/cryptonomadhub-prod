'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  CreditCard,
  Globe,
  Trash2,
  Save,
  Eye,
  EyeOff,
  MapPin,
  Database
} from 'lucide-react'
import { JurisdictionSelector } from '@/components/JurisdictionSelector'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function SettingsPage() {
  const { user, logout, isLoading, token, refreshUser } = useAuth()
  const router = useRouter()

  // Profile state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  // Display Preferences state
  const [language, setLanguage] = useState('en')
  const [theme, setTheme] = useState('system')
  const [preferencesSaving, setPreferencesSaving] = useState(false)
  const [preferencesMessage, setPreferencesMessage] = useState('')

  // Tax Jurisdiction state
  const [taxJurisdiction, setTaxJurisdiction] = useState<string | null>(null)
  const [currencyInfo, setCurrencyInfo] = useState<any>(null)

  // Cost Basis Settings state
  const [costBasisMethod, setCostBasisMethod] = useState('fifo')
  const [washSaleTracking, setWashSaleTracking] = useState(false)
  const [stakingAsIncome, setStakingAsIncome] = useState(true)
  const [costBasisSaving, setCostBasisSaving] = useState(false)
  const [costBasisMessage, setCostBasisMessage] = useState('')

  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [productUpdates, setProductUpdates] = useState(true)
  const [notificationsSaving, setNotificationsSaving] = useState(false)
  const [notificationsMessage, setNotificationsMessage] = useState('')

  // Account deletion state
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    } else if (user) {
      setEmail(user.email || '')
      setFullName(user.full_name || '')

      // Fetch tax jurisdiction and cost basis settings
      fetchTaxJurisdiction()
      fetchCostBasisSettings()
    }
  }, [user, isLoading, router])

  const fetchTaxJurisdiction = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cost-basis/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTaxJurisdiction(data.tax_jurisdiction)

        // Fetch currency info for this jurisdiction
        if (data.tax_jurisdiction) {
          fetchCurrencyInfo(data.tax_jurisdiction)
        }
      }
    } catch (error) {
      console.error('Failed to fetch tax jurisdiction:', error)
    }
  }

  const fetchCurrencyInfo = async (jurisdictionCode: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/regulations/`)
      if (response.ok) {
        const countries = await response.json()
        const country = countries.find((c: any) => c.country_code === jurisdictionCode)
        if (country) {
          setCurrencyInfo({
            currencyCode: country.currency_code,
            currencyName: country.currency_name,
            currencySymbol: country.currency_symbol,
            countryName: country.country_name,
            flagEmoji: country.flag_emoji,
            cryptoShortRate: country.crypto_short_rate,
            cryptoLongRate: country.crypto_long_rate,
            cryptoNotes: country.crypto_notes
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch currency info:', error)
    }
  }

  const fetchCostBasisSettings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cost-basis/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCostBasisMethod(data.default_method || 'fifo')
        // Wash sale and staking settings would come from backend if available
      }
    } catch (error) {
      console.error('Failed to fetch cost basis settings:', error)
    }
  }

  const handleSaveCostBasisSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setCostBasisSaving(true)
    setCostBasisMessage('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cost-basis/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          default_method: costBasisMethod,
          // wash_sale_tracking: washSaleTracking,  // Future backend support
          // staking_as_income: stakingAsIncome      // Future backend support
        })
      })

      if (response.ok) {
        setCostBasisMessage('Cost basis settings saved successfully')
      } else {
        const data = await response.json()
        setCostBasisMessage(data.detail || 'Failed to save settings')
      }
    } catch (error) {
      setCostBasisMessage('Network error. Please try again.')
    } finally {
      setCostBasisSaving(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMessage('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email
        })
      })

      if (response.ok) {
        setProfileMessage('Profile updated successfully')
        // Refresh user data to update the name in Dashboard
        await refreshUser()
      } else {
        const data = await response.json()
        setProfileMessage(data.detail || 'Failed to update profile')
      }
    } catch (error) {
      setProfileMessage('Network error. Please try again.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordMessage('')

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match')
      setPasswordSaving(false)
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage('Password must be at least 8 characters')
      setPasswordSaving(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      })

      if (response.ok) {
        setPasswordMessage('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await response.json()
        setPasswordMessage(data.detail || 'Failed to change password')
      }
    } catch (error) {
      setPasswordMessage('Network error. Please try again.')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault()
    setPreferencesSaving(true)
    setPreferencesMessage('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          language: language,
          theme: theme
        })
      })

      if (response.ok) {
        setPreferencesMessage('Display preferences saved successfully')
      } else {
        const data = await response.json()
        setPreferencesMessage(data.detail || 'Failed to save preferences')
      }
    } catch (error) {
      setPreferencesMessage('Network error. Please try again.')
    } finally {
      setPreferencesSaving(false)
    }
  }

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotificationsSaving(true)
    setNotificationsMessage('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email_notifications: emailNotifications,
          marketing_emails: marketingEmails,
          product_updates: productUpdates
        })
      })

      if (response.ok) {
        setNotificationsMessage('Notification preferences saved')
      } else {
        const data = await response.json()
        setNotificationsMessage(data.detail || 'Failed to save preferences')
      }
    } catch (error) {
      setNotificationsMessage('Network error. Please try again.')
    } finally {
      setNotificationsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/account`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        logout()
        router.push('/')
      } else {
        const data = await response.json()
        alert(data.detail || 'Failed to delete account')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading || !user) {
    return (
      <>
        <AppHeader />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-fuchsia-400 animate-spin" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
          </motion.div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-xl transition-all hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Account Settings
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{user.email}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            {/* Profile Section */}
            <motion.section
              variants={fadeInUp}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-violet-500/5 hover:shadow-violet-500/10 transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Profile</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Update your personal information</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                {profileMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm font-medium ${profileMessage.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {profileMessage}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.section>

            {/* Password Section */}
            <motion.section
              variants={fadeInUp}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-fuchsia-500/5 hover:shadow-fuchsia-500/10 transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Change Password</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Update your password</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                      placeholder="Enter new password (min 8 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {passwordMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm font-medium ${passwordMessage.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {passwordMessage}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-xl hover:from-fuchsia-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Lock className="w-4 h-4" />
                  {passwordSaving ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </motion.section>

            {/* Tax Jurisdiction Section - NEW! */}
            <motion.section
              variants={fadeInUp}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Tax Jurisdiction</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Set your tax residence for accurate calculations</p>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 mb-4 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm text-emerald-800 dark:text-emerald-300">
                  <strong>Important:</strong> Your tax jurisdiction determines which tax rates and rules apply to your crypto transactions.
                  This affects calculations in Tax Optimizer, Cost Basis, and all tax-related features.
                </p>
              </div>

              <JurisdictionSelector
                currentJurisdiction={taxJurisdiction}
                onJurisdictionChange={(newJurisdiction) => {
                  setTaxJurisdiction(newJurisdiction)
                  fetchCurrencyInfo(newJurisdiction)
                }}
                showBadgeOnly={false}
              />

              {/* Currency Info Badge */}
              {taxJurisdiction && currencyInfo && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border-2 border-emerald-200 dark:border-emerald-800"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{currencyInfo.flagEmoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                          💱 Detected Currency
                        </p>
                        <p className="text-base font-bold text-emerald-800 dark:text-emerald-200">
                          {currencyInfo.currencySymbol} {currencyInfo.currencyCode} - {currencyInfo.currencyName}
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2">
                          All financial data will be displayed in <strong>{currencyInfo.currencyName}</strong> with USD reference
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Tax Rates Preview */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-3 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 rounded-xl border-2 border-violet-200 dark:border-violet-800"
                  >
                    <p className="text-sm font-semibold text-violet-900 dark:text-violet-100 mb-3">
                      📊 Tax Rates for {currencyInfo.countryName}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-violet-200 dark:border-violet-700">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Short-term (&lt;1 year)</p>
                        <p className="text-lg font-bold text-violet-600 dark:text-fuchsia-400">
                          {currencyInfo.cryptoShortRate !== null
                            ? `${(currencyInfo.cryptoShortRate * 100).toFixed(1)}%`
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-violet-200 dark:border-violet-700">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Long-term (&gt;1 year)</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {currencyInfo.cryptoLongRate !== null
                            ? `${(currencyInfo.cryptoLongRate * 100).toFixed(1)}%`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {currencyInfo.cryptoNotes && (
                      <p className="text-xs text-violet-700 dark:text-violet-300 bg-white dark:bg-slate-900 p-2 rounded border border-violet-200 dark:border-violet-700">
                        ℹ️ {currencyInfo.cryptoNotes}
                      </p>
                    )}
                  </motion.div>
                </>
              )}
            </motion.section>

            {/* Cost Basis Settings Section */}
            <motion.section
              variants={fadeInUp}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Cost Basis Settings</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Configure how crypto sales are calculated for tax purposes</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 mb-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>ℹ️ Info:</strong> Your cost basis method determines which cryptocurrency units are considered sold first when you make a transaction.
                </p>
              </div>

              <form onSubmit={handleSaveCostBasisSettings} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Default Cost Basis Method
                  </label>
                  <select
                    value={costBasisMethod}
                    onChange={(e) => setCostBasisMethod(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                  >
                    <option value="fifo">FIFO - First In First Out (Default)</option>
                    <option value="lifo">LIFO - Last In First Out</option>
                    <option value="hifo">HIFO - Highest In First Out</option>
                    <option value="specific_id">Specific Identification</option>
                  </select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <strong>FIFO:</strong> Sells oldest units first. <strong>LIFO:</strong> Sells newest units first. <strong>HIFO:</strong> Sells highest cost units first to minimize gains.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                    <input
                      type="checkbox"
                      checked={washSaleTracking}
                      onChange={(e) => setWashSaleTracking(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Enable Wash Sale Tracking
                        <span className="ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">US Only</span>
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Track and disallow losses from substantially identical securities sold and repurchased within 30 days (US tax rule)
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 italic">
                        Note: Currently not enforced for crypto by IRS, but may change
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                    <input
                      type="checkbox"
                      checked={stakingAsIncome}
                      onChange={(e) => setStakingAsIncome(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Treat Staking Rewards as Ordinary Income
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Staking rewards will be treated as income at the time of receipt (recommended by most tax authorities)
                      </p>
                    </div>
                  </label>
                </div>

                {costBasisMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm font-medium ${costBasisMessage.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {costBasisMessage}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={costBasisSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  {costBasisSaving ? 'Saving...' : 'Save Cost Basis Settings'}
                </button>
              </form>
            </motion.section>

            {/* Display Preferences Section */}
            <motion.section
              variants={fadeInUp}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-violet-500/5 hover:shadow-violet-500/10 transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Display Preferences</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Customize how information is displayed</p>
                </div>
              </div>

              <form onSubmit={handleSavePreferences} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Language
                  </label>
                  <LanguageSwitcher variant="dropdown" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                  >
                    <option value="system">System Default</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                {preferencesMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm font-medium ${preferencesMessage.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {preferencesMessage}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={preferencesSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  {preferencesSaving ? 'Saving...' : 'Save Preferences'}
                </button>
              </form>
            </motion.section>

            {/* Notifications Section */}
            <motion.section
              variants={fadeInUp}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-fuchsia-500/5 hover:shadow-fuchsia-500/10 transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Notifications</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Manage your notification preferences</p>
                </div>
              </div>

              <form onSubmit={handleSaveNotifications} className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all group">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 transition-all"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-fuchsia-400 transition-colors">Email Notifications</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Receive important updates via email</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all group">
                    <input
                      type="checkbox"
                      checked={productUpdates}
                      onChange={(e) => setProductUpdates(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 transition-all"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-fuchsia-400 transition-colors">Product Updates</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Get notified about new features</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all group">
                    <input
                      type="checkbox"
                      checked={marketingEmails}
                      onChange={(e) => setMarketingEmails(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 transition-all"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-fuchsia-400 transition-colors">Marketing Emails</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Receive promotional content and tips</p>
                    </div>
                  </label>
                </div>

                {notificationsMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm font-medium ${notificationsMessage.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {notificationsMessage}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={notificationsSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-xl hover:from-fuchsia-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  {notificationsSaving ? 'Saving...' : 'Save Notification Settings'}
                </button>
              </form>
            </motion.section>

            {/* Subscription Section */}
            <motion.section
              variants={fadeInUp}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-violet-500/5 hover:shadow-violet-500/10 transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Subscription</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Manage your subscription plan</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 rounded-xl p-5 mb-4 border border-violet-200 dark:border-violet-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Current Plan</p>
                  <span className="px-3 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    {user?.license?.tier ? user.license.tier.charAt(0).toUpperCase() + user.license.tier.slice(1) : 'Free'} Tier
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {user?.license?.tier === 'free' || !user?.license?.tier
                    ? 'You are currently on the free tier with limited features.'
                    : `You are subscribed to the ${user.license.tier} plan.${user.license.expires_at ? ` Expires ${new Date(user.license.expires_at).toLocaleDateString()}` : ''}`
                  }
                </p>
              </div>

              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <CreditCard className="w-4 h-4" />
                Upgrade Plan
              </Link>
            </motion.section>

            {/* Danger Zone */}
            <motion.section
              variants={fadeInUp}
              className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-2xl p-6 border border-red-200 dark:border-red-800 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-red-900 dark:text-red-200">Danger Zone</h2>
                  <p className="text-sm text-red-700 dark:text-red-300">Irreversible actions</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 mb-4 border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Delete Account
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Once you delete your account, there is no going back. All your data, simulations, and settings will be permanently deleted.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Type <strong>DELETE</strong> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                    placeholder="DELETE"
                  />
                </div>

                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? 'Deleting...' : 'Delete Account Permanently'}
                </button>
              </div>
            </motion.section>
          </motion.div>
        </main>
      </div>
      <Footer />
    </>
  )
}
