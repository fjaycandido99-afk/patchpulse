import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Download PatchPulse'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #171717 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo */}
        <img
          src="https://patchpulse.app/logo.png"
          width={180}
          height={180}
          style={{
            marginBottom: 32,
            borderRadius: 36,
          }}
        />

        {/* App Name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: 'white',
            marginBottom: 16,
            display: 'flex',
          }}
        >
          PatchPulse
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#a1a1aa',
            marginBottom: 40,
            display: 'flex',
          }}
        >
          Track game patches. Play smarter.
        </div>

        {/* Download badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 32px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <span style={{ color: 'white', fontSize: 24, fontWeight: 600 }}>
            Download on the App Store
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
