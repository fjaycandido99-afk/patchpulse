import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 95,
          fontFamily: 'sans-serif',
          fontWeight: 800,
          background: '#0a0a15',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 36,
        }}
      >
        <span
          style={{
            background: 'linear-gradient(90deg, #b085f5, #f0b1a6, #ffc56e)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          P
        </span>
      </div>
    ),
    {
      ...size,
    }
  )
}
