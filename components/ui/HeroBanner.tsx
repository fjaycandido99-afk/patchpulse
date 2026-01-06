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
    <>
      {/* Mobile: Fixed 16:9 banner - below header */}
      <div className="md:hidden fixed inset-x-0 top-14 -z-10">
        <div className="relative w-full aspect-video max-h-[200px] sm:max-h-[240px]">
          {imageUrl && !imageError ? (
            <>
              <Image
                src={imageUrl}
                alt={altText}
                fill
                className="object-cover"
                priority
                sizes="100vw"
                unoptimized
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-background" />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${fallbackColor}40 0%, var(--background) 100%)`
              }}
            />
          )}
        </div>
      </div>

      {/* Desktop: Fixed parallax banner */}
      <div className="hidden md:block fixed inset-x-0 top-0 h-[450px] -z-10 left-64">
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background" />
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
    </>
  )
}
