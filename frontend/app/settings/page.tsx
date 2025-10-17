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
  EyeOff
} from 'lucide-react'

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
  const { user, logout, isLoading, token } = useAuth()
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

  // Preferences state
  const [defaultCurrency, setDefaultCurrency] = useState('USD')
  const [language, setLanguage] = useState('en')
  const [theme, setTheme] = useState('system')
  const [preferencesSaving, setPreferencesSaving] = useState(false)
  const [preferencesMessage, setPreferencesMessage] = useState('')

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
    }
  }, [user, isLoading, router])

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
          default_currency: defaultCurrency,
          language: language,
          theme: theme
        })
      })

      if (response.ok) {
        setPreferencesMessage('Preferences saved successfully')
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

            {/* Preferences Section */}
            <motion.section
              variants={fadeInUp}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-violet-500/5 hover:shadow-violet-500/10 transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Preferences</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Customize your experience</p>
                </div>
              </div>

              <form onSubmit={handleSavePreferences} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Default Currency
                  </label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CHF">CHF - Swiss Franc</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="BTC">BTC - Bitcoin</option>
                  </select>
                </div>

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
                    Free Tier
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You are currently on the free tier with limited features.
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
