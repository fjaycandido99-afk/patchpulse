'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, EyeOff, AlertTriangle } from 'lucide-react'
import { removeFromBacklog, unfollowGame } from '@/app/(main)/backlog/actions'

type GameManagementProps = {
  gameId: string
  gameName: string
  isInBacklog: boolean
  isFollowing: boolean
}

export function GameManagement({
  gameId,
  gameName,
  isInBacklog,
  isFollowing,
}: GameManagementProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [isUnfollowing, setIsUnfollowing] = useState(false)
  const [showConfirm, setShowConfirm] = useState<'remove' | 'unfollow' | null>(null)
  const router = useRouter()

  const handleRemoveFromBacklog = async () => {
    setIsRemoving(true)
    try {
      await removeFromBacklog(gameId)
      router.push('/backlog')
      router.refresh()
    } catch (error) {
      console.error('Failed to remove from backlog:', error)
    } finally {
      setIsRemoving(false)
      setShowConfirm(null)
    }
  }

  const handleUnfollow = async () => {
    setIsUnfollowing(true)
    try {
      await unfollowGame(gameId)
      router.push('/backlog')
      router.refresh()
    } catch (error) {
      console.error('Failed to unfollow game:', error)
    } finally {
      setIsUnfollowing(false)
      setShowConfirm(null)
    }
  }

  // Confirmation modal
  if (showConfirm) {
    const isRemove = showConfirm === 'remove'
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-400">
              {isRemove ? 'Remove from Library?' : 'Unfollow Game?'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isRemove
                ? `This will remove "${gameName}" from your library and delete your progress data.`
                : `You will no longer receive updates for "${gameName}".`}
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={isRemove ? handleRemoveFromBacklog : handleUnfollow}
                disabled={isRemoving || isUnfollowing}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isRemoving || isUnfollowing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <h2 className="font-semibold mb-4">Manage Game</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        {isInBacklog && (
          <button
            onClick={() => setShowConfirm('remove')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Remove from Library
          </button>
        )}
        {isFollowing && !isInBacklog && (
          <button
            onClick={() => setShowConfirm('unfollow')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 text-sm font-medium transition-colors"
          >
            <EyeOff className="h-4 w-4" />
            Unfollow Game
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        {isInBacklog
          ? 'Removing will delete your progress and playtime data for this game.'
          : 'Unfollowing will stop updates and news for this game.'}
      </p>
    </div>
  )
}
