'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

interface FeatureFlag {
  id: number
  name: string
  description: string | null
  enabled_globally: boolean
  beta_only: boolean
  rollout_percentage: number
  enabled_countries: string[] | null
  created_at: string
  updated_at: string | null
}

export default function FeatureFlagsAdminPage() {
  const { user, token, isLoading } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [isLoadingFlags, setIsLoadingFlags] = useState(true)
  const [editingFlag, setEditingFlag] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // New flag creation
  const [newFlagName, setNewFlagName] = useState('')
  const [newFlagDescription, setNewFlagDescription] = useState('')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    } else if (!isLoading && user && user.role !== 'admin' && user.email !== 'welgolimited@gmail.com') {
      showToast('Admin access required', 'error')
      router.push('/dashboard')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading])

  useEffect(() => {
    if (user && (user.role === 'admin' || user.email === 'welgolimited@gmail.com')) {
      fetchFlags()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchFlags = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/feature-flags`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch feature flags')
      }

      const data = await response.json()
      setFlags(data)
    } catch (error: any) {
      showToast(error.message || 'Failed to load feature flags', 'error')
    } finally {
      setIsLoadingFlags(false)
    }
  }

  const updateFlag = async (flagName: string, updates: Partial<FeatureFlag>) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/feature-flags/${flagName}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updates)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update feature flag')
      }

      const data = await response.json()
      showToast(data.message, 'success')
      await fetchFlags()
      setEditingFlag(null)
    } catch (error: any) {
      showToast(error.message || 'Failed to update feature flag', 'error')
    }
  }

  const createFlag = async () => {
    if (!newFlagName.trim()) {
      showToast('Flag name is required', 'error')
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/feature-flags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newFlagName,
          description: newFlagDescription || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create feature flag')
      }

      const data = await response.json()
      showToast(data.message, 'success')
      await fetchFlags()
      setShowCreateModal(false)
      setNewFlagName('')
      setNewFlagDescription('')
    } catch (error: any) {
      showToast(error.message || 'Failed to create feature flag', 'error')
    }
  }

  const deleteFlag = async (flagName: string) => {
    if (!confirm(`Are you sure you want to delete feature flag "${flagName}"?`)) {
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/feature-flags/${flagName}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete feature flag')
      }

      const data = await response.json()
      showToast(data.message, 'success')
      await fetchFlags()
    } catch (error: any) {
      showToast(error.message || 'Failed to delete feature flag', 'error')
    }
  }

  if (isLoading || isLoadingFlags) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!user || (user.role !== 'admin' && user.email !== 'welgolimited@gmail.com')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Feature Flags</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage feature rollouts and A/B testing
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Create Flag
            </button>
          </div>
        </div>

        {/* Feature Flags List */}
        <div className="space-y-4">
          {flags.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">No feature flags created yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create your first feature flag
              </button>
            </div>
          ) : (
            flags.map((flag) => (
              <div
                key={flag.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {flag.name}
                    </h3>
                    {flag.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {flag.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteFlag(flag.name)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2"
                    title="Delete flag"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Enabled Globally */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flag.enabled_globally}
                        onChange={(e) =>
                          updateFlag(flag.name, { enabled_globally: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enabled Globally
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 ml-7">
                      Enable for all users
                    </p>
                  </div>

                  {/* Beta Only */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flag.beta_only}
                        onChange={(e) => updateFlag(flag.name, { beta_only: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Beta Only
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 ml-7">
                      Only for beta testers
                    </p>
                  </div>

                  {/* Rollout Percentage */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                      Rollout: {flag.rollout_percentage}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={flag.rollout_percentage}
                      onChange={(e) =>
                        updateFlag(flag.name, { rollout_percentage: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Percentage of users
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-500">
                  <span>
                    Created: {new Date(flag.created_at).toLocaleDateString()}
                  </span>
                  {flag.updated_at && (
                    <span className="ml-4">
                      Updated: {new Date(flag.updated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Create Feature Flag
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Flag Name *
                  </label>
                  <input
                    type="text"
                    value={newFlagName}
                    onChange={(e) => setNewFlagName(e.target.value)}
                    placeholder="e.g., new_feature_x"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newFlagDescription}
                    onChange={(e) => setNewFlagDescription(e.target.value)}
                    placeholder="What does this flag control?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewFlagName('')
                    setNewFlagDescription('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createFlag}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
