/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable standalone output for Docker production builds
  // This creates a minimal production bundle
  output: 'standalone',
}

module.exports = nextConfig
