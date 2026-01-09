const { withSentryConfig } = require('@sentry/nextjs')

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  customWorkerSrc: 'worker',
  customWorkerDest: 'public',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.igdb.com',
        pathname: '/igdb/image/upload/**',
      },
      {
        protocol: 'https',
        hostname: 'media.steampowered.com',
        pathname: '/steamcommunity/public/images/apps/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.cloudflare.steamstatic.com',
        pathname: '/steam/apps/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.akamai.steamstatic.com',
        pathname: '/steam/apps/**',
      },
      {
        protocol: 'https',
        hostname: 'jewqsavlifeivsywhhqo.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'blz-contentstack-images.akamaized.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn2.unrealengine.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.contentstack.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fastcdn.hoyoverse.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets-prd.ignimgs.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.mos.cms.futurecdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kotaku.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.kinja-img.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assetsio.gnwcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gamespot.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gamespot.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static0.polygonimages.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.vox-cdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.vg247.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assetsio.reedpopcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'duet-cdn.vox-cdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.destructoid.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'destructoid.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i1.wp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i2.wp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.imgix.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.gamespot.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'blogger.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
    ],
  },
  turbopack: {},
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
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
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com https://*.sentry.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.steampowered.com https://api.igdb.com https://id.twitch.tv https://www.cheapshark.com https://api.rawg.io https://*.sentry.io https://*.ingest.sentry.io",
              "frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com https://www.youtube.com https://youtube.com",
              "frame-ancestors 'self'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

// Sentry config options
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  // Upload source maps only in production
  dryRun: process.env.NODE_ENV !== 'production',
  // Disable telemetry
  telemetry: false,
}

// Wrap with PWA first, then Sentry
module.exports = withSentryConfig(withPWA(nextConfig), sentryWebpackPluginOptions)
