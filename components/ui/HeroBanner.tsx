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
      {/* Mobile: Fixed banner - below header */}
      <div className="md:hidden fixed inset-x-0 top-14 -z-10">
        <div className="relative w-full h-[280px] sm:h-[320px]">
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
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-background" />
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
      <div className="hidden md:block fixed inset-x-0 top-0 h-[500px] -z-10 left-64">
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
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-background" />
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
