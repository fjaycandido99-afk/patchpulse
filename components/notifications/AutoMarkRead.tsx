'use client'

import { useEffect } from 'react'

type AutoMarkReadProps = {
  contentType: 'patch' | 'news'
  contentId: string
}

export function AutoMarkRead({ contentType, contentId }: AutoMarkReadProps) {
  useEffect(() => {
    // Mark notification as read when viewing content
    async function markAsRead() {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'mark_read_by_content',
            contentType,
            contentId,
          }),
        })
      } catch (error) {
        // Silent fail - non-critical feature
        console.error('Failed to auto-mark notification as read:', error)
      }
    }

    markAsRead()
  }, [contentType, contentId])

  // This component doesn't render anything
  return null
}
