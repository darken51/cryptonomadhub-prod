const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable standalone output for Docker production builds
  output: 'standalone',

  // Environment variables - force production URL if not set
  env: {
    NEXT_PUBLIC_API_URL: (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim())
      || 'https://cryptonomadhub-prod-1.onrender.com',
  },

  // ✅ Bundle optimization
  compress: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // ✅ PERFORMANCE: Experimental optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },

  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  // Production optimizations
  poweredByHeader: false,

  // ✅ SECURITY HEADERS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },

  // ✅ SUPPRESS DEV WARNINGS
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config, { isServer }) => {
      // Suppress infrastructure logging
      config.infrastructureLogging = {
        level: 'error',
      }

      // Suppress annoying warnings
      config.ignoreWarnings = [
        /Skipping auto-scroll behavior/,
        /was preloaded using link preload/,
      ]

      return config
    },

    // Disable source maps in dev (faster builds)
    productionBrowserSourceMaps: false,
  }),

  // ✅ PRODUCTION: Aggressive optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'], // Keep errors/warnings
      },
    },
  }),
}

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry webpack plugin
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
}

module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig
