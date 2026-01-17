'use client'

import { useState, useTransition } from 'react'
import { Plus, Check, Loader2 } from 'lucide-react'
import { followGame } from '@/app/(main)/actions/games'
import { useToastUI } from '@/components/ui/toast'

type FollowGameButtonProps = {
  gameId: string
  gameName: string
  initialFollowing?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
}

export function FollowGameButton({
  gameId,
  gameName,
  initialFollowing = false,
  size = 'md',
  variant = 'default',
}: FollowGameButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToastUI()

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      try {
        const result = await followGame(gameId)
        if (result.success) {
          setIsFollowing(result.following ?? false)
        } else if (result.error === 'limit_reached') {
          toast.error(`Limit reached: ${result.maxCount} games. Upgrade to Pro for unlimited.`)
        } else if (result.error) {
          toast.error(result.error)
        }
      } catch (error) {
        console.error('Failed to follow game:', error)
        toast.error('Failed to follow game')
      }
    })
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-sm gap-2',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  }

  if (isFollowing) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`flex items-center font-medium rounded-lg transition-all active:scale-95 disabled:opacity-50 ${sizeClasses[size]} ${
          variant === 'outline'
            ? 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20'
            : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
        }`}
        title={`Unfollow ${gameName}`}
      >
        {isPending ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : (
          <Check className={iconSizes[size]} />
        )}
        Following
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center font-medium rounded-lg transition-all active:scale-95 disabled:opacity-50 ${sizeClasses[size]} ${
        variant === 'outline'
          ? 'bg-white/5 text-foreground border border-white/20 hover:bg-primary/20 hover:text-primary hover:border-primary/30'
          : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
      }`}
      title={`Follow ${gameName}`}
    >
      {isPending ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <Plus className={iconSizes[size]} />
      )}
      Follow
    </button>
  )
}
