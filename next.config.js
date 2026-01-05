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
      // Blizzard CDN (Overwatch, Diablo, WoW, etc.)
      {
        protocol: 'https',
        hostname: 'blz-contentstack-images.akamaized.net',
        pathname: '/**',
      },
      // Epic Games CDN (Fortnite, etc.)
      {
        protocol: 'https',
        hostname: 'cdn2.unrealengine.com',
        pathname: '/**',
      },
      // Riot CDN (League of Legends, Valorant, etc.)
      {
        protocol: 'https',
        hostname: 'images.contentstack.io',
        pathname: '/**',
      },
      // miHoYo CDN (Genshin, Honkai, etc.)
      {
        protocol: 'https',
        hostname: 'fastcdn.hoyoverse.com',
        pathname: '/**',
      },
      // Wikipedia (fallback for non-Steam games)
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      // RAWG (game database images)
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
        pathname: '/**',
      },
      // IGN
      {
        protocol: 'https',
        hostname: 'assets-prd.ignimgs.com',
        pathname: '/**',
      },
      // Future PLC (PC Gamer, GamesRadar, etc.)
      {
        protocol: 'https',
        hostname: 'cdn.mos.cms.futurecdn.net',
        pathname: '/**',
      },
      // Kotaku / Gizmodo Media
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
      // Eurogamer / Gamer Network
      {
        protocol: 'https',
        hostname: 'assetsio.gnwcdn.com',
        pathname: '/**',
      },
      // GameSpot
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
      // Polygon / Vox Media
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
      // VG247
      {
        protocol: 'https',
        hostname: 'assets.vg247.com',
        pathname: '/**',
      },
      // Rock Paper Shotgun
      {
        protocol: 'https',
        hostname: 'assetsio.reedpopcdn.com',
        pathname: '/**',
      },
      // The Verge
      {
        protocol: 'https',
        hostname: 'duet-cdn.vox-cdn.com',
        pathname: '/**',
      },
      // Destructoid
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
      // WordPress / Jetpack CDN (many gaming sites use this)
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
      // Cloudinary (common CDN)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Imgix (common CDN)
      {
        protocol: 'https',
        hostname: '**.imgix.net',
        pathname: '/**',
      },
      // Additional GameSpot CDNs
      {
        protocol: 'https',
        hostname: 'static.gamespot.com',
        pathname: '/**',
      },
      // Feedburner images
      {
        protocol: 'https',
        hostname: 'blogger.googleusercontent.com',
        pathname: '/**',
      },
      // Generic image CDNs
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // YouTube thumbnails
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
  // Empty turbopack config to acknowledge webpack configs from plugins
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.steampowered.com https://api.igdb.com https://id.twitch.tv https://www.cheapshark.com https://api.rawg.io",
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

module.exports = withPWA(nextConfig)
