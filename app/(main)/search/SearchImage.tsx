'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Gamepad2, FileText, Newspaper } from 'lucide-react'

type ImageType = 'game' | 'patch' | 'news'

type SearchImageProps = {
  src: string
  alt: string
  type: ImageType
  className?: string
  fill?: boolean
}

const iconMap = {
  game: Gamepad2,
  patch: FileText,
  news: Newspaper,
}

const sizeMap = {
  game: 'w-10 h-10',
  patch: 'w-14 h-14',
  news: 'w-14 h-14',
}

export function SearchImage({ src, alt, type, className, fill }: SearchImageProps) {
  const [hasError, setHasError] = useState(false)
  const Icon = iconMap[type]
  const sizeClass = sizeMap[type]

  if (hasError) {
    if (fill) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
      )
    }
    return (
      <div className={`${sizeClass} rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
    )
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className || 'object-cover'}
        unoptimized
        onError={() => setHasError(true)}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={type === 'game' ? 40 : 56}
      height={type === 'game' ? 40 : 56}
      className={className || `${sizeClass} rounded-md object-cover flex-shrink-0`}
      unoptimized
      onError={() => setHasError(true)}
    />
  )
}
