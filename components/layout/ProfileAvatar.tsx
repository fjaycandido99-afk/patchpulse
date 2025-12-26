'use client'

import Link from 'next/link'
import Image from 'next/image'
import { User } from 'lucide-react'

type ProfileAvatarProps = {
  avatarUrl?: string | null
  displayName?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export function ProfileAvatar({ avatarUrl, displayName, size = 'md' }: ProfileAvatarProps) {
  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : null

  return (
    <Link
      href="/profile"
      className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background`}
      title="Profile"
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={displayName || 'Profile'}
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      ) : initials ? (
        <div className="w-full h-full bg-gradient-to-br from-primary/80 to-violet-600/80 flex items-center justify-center text-white font-semibold text-sm">
          {initials}
        </div>
      ) : (
        <div className="w-full h-full bg-white/10 flex items-center justify-center text-muted-foreground">
          <User className={iconSizes[size]} />
        </div>
      )}
    </Link>
  )
}
