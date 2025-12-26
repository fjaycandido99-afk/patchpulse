import Image from 'next/image'

type GameLogoProps = {
  logoUrl?: string | null
  gameName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showFallback?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-auto max-w-16',
  md: 'h-6 w-auto max-w-24',
  lg: 'h-8 w-auto max-w-32',
}

const fallbackSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export function GameLogo({
  logoUrl,
  gameName,
  size = 'md',
  className = '',
  showFallback = true,
}: GameLogoProps) {
  if (logoUrl) {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <Image
          src={logoUrl}
          alt={`${gameName} logo`}
          width={128}
          height={32}
          className="object-contain h-full w-auto"
          style={{ filter: 'brightness(0) invert(1)' }} // Make monochrome white
        />
      </div>
    )
  }

  if (!showFallback) {
    return null
  }

  // Text fallback with styled first letter
  return (
    <span className={`font-bold text-white ${fallbackSizes[size]} ${className}`}>
      {gameName}
    </span>
  )
}

// Compact version for cards
export function GameLogoMini({
  logoUrl,
  gameName,
  className = '',
}: Pick<GameLogoProps, 'logoUrl' | 'gameName' | 'className'>) {
  if (logoUrl) {
    return (
      <div className={`relative h-4 w-auto max-w-12 ${className}`}>
        <Image
          src={logoUrl}
          alt={gameName}
          width={48}
          height={16}
          className="object-contain h-full w-auto opacity-70"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>
    )
  }

  // Abbreviated text fallback
  const initials = gameName
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()

  return (
    <span className={`text-xs font-bold text-zinc-400 ${className}`}>
      {initials}
    </span>
  )
}
