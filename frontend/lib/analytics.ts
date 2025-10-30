/**
 * Unified Analytics Service
 *
 * Handles all analytics tracking across PostHog, Plausible, and custom events
 */

import posthog from 'posthog-js'

// Initialize PostHog
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

if (typeof window !== 'undefined' && POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug() // Enable debug mode in development
      }
    },
    capture_pageview: false, // We'll manually track pageviews
    capture_pageleave: true,
    autocapture: false, // Disable autocapture for privacy
  })
}

export const analytics = {
  /**
   * Track page view
   */
  page: (pageName?: string) => {
    if (typeof window !== 'undefined' && POSTHOG_KEY) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        page_name: pageName || document.title,
      })
    }
  },

  /**
   * Identify user
   */
  identify: (userId: string, traits?: Record<string, any>) => {
    if (POSTHOG_KEY) {
      posthog.identify(userId, traits)
    }
  },

  /**
   * Track event
   */
  track: (eventName: string, properties?: Record<string, any>) => {
    if (POSTHOG_KEY) {
      posthog.capture(eventName, properties)
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', eventName, properties)
    }
  },

  /**
   * Reset user identity (on logout)
   */
  reset: () => {
    if (POSTHOG_KEY) {
      posthog.reset()
    }
  },

  /**
   * Set user properties
   */
  setUserProperties: (properties: Record<string, any>) => {
    if (POSTHOG_KEY) {
      posthog.people.set(properties)
    }
  },

  /**
   * Track revenue event
   */
  revenue: (amount: number, currency: string = 'USD', properties?: Record<string, any>) => {
    if (POSTHOG_KEY) {
      posthog.capture('revenue', {
        revenue: amount,
        currency,
        ...properties,
      })
    }
  },
}

// Convenience functions for common events

export const trackSignup = (method: 'email' | 'google', userId: string) => {
  analytics.track('user_signup', {
    method,
    user_id: userId,
    timestamp: new Date().toISOString(),
  })
}

export const trackLogin = (method: 'email' | 'google', userId: string) => {
  analytics.track('user_login', {
    method,
    user_id: userId,
    timestamp: new Date().toISOString(),
  })
}

export const trackUpgrade = (fromTier: string, toTier: string, amount: number, userId: string) => {
  analytics.track('subscription_upgrade', {
    from_tier: fromTier,
    to_tier: toTier,
    amount,
    user_id: userId,
    timestamp: new Date().toISOString(),
  })
  analytics.revenue(amount, 'USD', {
    tier: toTier,
    user_id: userId,
  })
}

export const trackDeFiAudit = (userId: string, blockchain: string, transactionCount: number) => {
  analytics.track('defi_audit_completed', {
    user_id: userId,
    blockchain,
    transaction_count: transactionCount,
    timestamp: new Date().toISOString(),
  })
}

export const trackSimulation = (userId: string, countries: string[]) => {
  analytics.track('simulation_run', {
    user_id: userId,
    countries: countries.join(','),
    country_count: countries.length,
    timestamp: new Date().toISOString(),
  })
}

export const trackChatMessage = (userId: string, tier: string) => {
  analytics.track('chat_message_sent', {
    user_id: userId,
    tier,
    timestamp: new Date().toISOString(),
  })
}

export const trackFeatureUsage = (feature: string, userId: string, properties?: Record<string, any>) => {
  analytics.track(`feature_used_${feature}`, {
    user_id: userId,
    feature,
    ...properties,
    timestamp: new Date().toISOString(),
  })
}

export const trackError = (error: Error, context?: Record<string, any>) => {
  analytics.track('error_occurred', {
    error_message: error.message,
    error_stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
  })
}

export const trackConversion = (conversionType: string, value?: number, properties?: Record<string, any>) => {
  analytics.track('conversion', {
    conversion_type: conversionType,
    value,
    ...properties,
    timestamp: new Date().toISOString(),
  })
}

export const trackCountryVisit = (countryCode: string, countryName: string, userId?: string) => {
  analytics.track('country_page_viewed', {
    country_code: countryCode,
    country_name: countryName,
    user_id: userId,
    timestamp: new Date().toISOString(),
  })
}

export const trackDataDownload = (format: 'json' | 'csv', userId?: string) => {
  analytics.track('data_downloaded', {
    format,
    user_id: userId,
    timestamp: new Date().toISOString(),
  })
}

export const trackSearch = (query: string, resultsCount: number, userId?: string) => {
  analytics.track('search_performed', {
    query,
    results_count: resultsCount,
    user_id: userId,
    timestamp: new Date().toISOString(),
  })
}
