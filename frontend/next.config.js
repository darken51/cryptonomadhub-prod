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
    // Optimize CSS
    optimizeCss: true,
  },

  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  // Production optimizations
  poweredByHeader: false,

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

module.exports = nextConfig
