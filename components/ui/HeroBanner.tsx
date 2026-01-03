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
    <div className="fixed inset-x-0 top-0 -z-10 overflow-hidden">
      {/* 16:9 aspect ratio container with max-height caps */}
      <div className="relative w-full aspect-video max-h-[200px] sm:max-h-[240px] md:max-h-[300px] lg:max-h-[360px]">
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
            {/* Bottom gradient for content readability */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, rgba(10,10,25,0.05) 0%, rgba(10,10,25,0.2) 40%, rgba(10,10,25,0.8) 80%, rgb(10,10,25) 100%)'
              }}
            />
            {/* Top gradient to blend with header */}
            <div
              className="absolute inset-x-0 top-0 h-20"
              style={{
                background: 'linear-gradient(to bottom, rgba(10,15,30,0.6) 0%, transparent 100%)'
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(180deg, ${fallbackColor}40 0%, rgb(10,10,25) 100%)`
            }}
          >
            <Gamepad2 className="w-16 h-16 text-white/10" />
          </div>
        )}
      </div>
    </div>
  )
}
