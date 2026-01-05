'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Gamepad2 } from 'lucide-react'

type HeroBannerProps = {
  imageUrl: string | null
  altText: string
  fallbackColor?: string
}

export function HeroBanner({ imageUrl, altText, fallbackColor = '#1a1a2e' }: HeroBannerProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="fixed inset-x-0 top-0 h-[300px] sm:h-[350px] md:h-[450px] -z-10 md:left-64">
      {imageUrl && !imageError ? (
        <>
          <Image
            src={imageUrl}
            alt={altText}
            fill
            className="object-cover object-top"
            priority
            sizes="100vw"
            unoptimized
            onError={() => setImageError(true)}
          />
          {/* Gradient overlay - lighter at top for header visibility, fades to background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background" />
        </>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `linear-gradient(180deg, ${fallbackColor}40 0%, var(--background) 100%)`
          }}
        >
          <Gamepad2 className="w-16 h-16 text-white/10" />
        </div>
      )}
    </div>
  )
}
