import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'PatchPulse - Track Games',
    template: '%s | PatchPulse',
  },
  description: 'Track gaming patch notes, manage your backlog, and get AI-powered recommendations on what to play next. Stay updated with the latest game updates.',
  keywords: ['game patches', 'patch notes', 'game backlog', 'gaming tracker', 'game updates', 'backlog manager'],
  authors: [{ name: 'PatchPulse' }],
  creator: 'PatchPulse',
  publisher: 'PatchPulse',
  manifest: '/manifest.json',
  metadataBase: new URL('https://patchpulse.app'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-icon.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://patchpulse.app',
    siteName: 'PatchPulse',
    title: 'PatchPulse - Track Games',
    description: 'Track gaming patch notes, manage your backlog, and get AI-powered recommendations on what to play next.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'PatchPulse - Your Gaming Companion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PatchPulse - Track Games',
    description: 'Track gaming patch notes, manage your backlog, and get AI-powered recommendations on what to play next.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PatchPulse',
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// JSON-LD structured data for Google
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PatchPulse',
  url: 'https://patchpulse.app',
  logo: 'https://patchpulse.app/logo.png',
  description: 'Track gaming patch notes, manage your backlog, and get AI-powered recommendations on what to play next.',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web, iOS',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  publisher: {
    '@type': 'Organization',
    name: 'PatchPulse',
    logo: {
      '@type': 'ImageObject',
      url: 'https://patchpulse.app/logo.png',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  )
}
