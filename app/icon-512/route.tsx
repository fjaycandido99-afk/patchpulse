import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 280,
          fontFamily: 'sans-serif',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #0a0a15 0%, #1a1a2e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 100,
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
      width: 512,
      height: 512,
    }
  )
}
