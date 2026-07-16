import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.maplibre.org",
              "style-src 'self' 'unsafe-inline' https://api.maplibre.org",
              "img-src 'self' data: blob: https://*.cartocdn.com https://basemaps.cartocdn.com",
              "connect-src 'self' https://api.maplibre.org https://*.cartocdn.com https://*.supabase.co https://cckpapi.worldbank.org",
              "worker-src blob:",
            ].join('; '),
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/map', destination: '/explorer', permanent: true },
      { source: '/assistant', destination: '/', permanent: false },
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-*'],
  },
  turbopack: {},
}

export default nextConfig
