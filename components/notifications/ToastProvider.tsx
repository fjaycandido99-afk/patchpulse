'use client'

import { useEffect, useState, useCallback, createContext, useContext } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LiveToast } from './LiveToast'

type ToastNotification = {
  id: string
  user_id: string
  type: 'new_patch' | 'new_news' | 'game_release' | 'ai_digest' | 'system'
  title: string
  body: string | null
  priority: number
  game_id: string | null
  patch_id: string | null
  news_id: string | null
  created_at: string
  game?: {
    id: string
    name: string
    slug: string
    cover_url: string | null
  } | null
}

type ToastContextType = {
  showToast: (notification: ToastNotification) => void
  dismissToast: (id: string) => void
  testToast: () => void // For development testing
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

type Props = {
  children: React.ReactNode
  userId?: string
}

export function ToastProvider({ children, userId }: Props) {
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)

  const showToast = useCallback((notification: ToastNotification) => {
    setToasts(prev => {
      // Prevent duplicates
      if (prev.some(t => t.id === notification.id)) return prev
      // Keep max 3 toasts
      const updated = [notification, ...prev].slice(0, 3)
      return updated
    })

    // Auto-dismiss after 8 seconds (longer for high priority)
    const dismissDelay = notification.priority >= 4 ? 10000 : 6000
    setTimeout(() => {
      dismissToast(notification.id)
    }, dismissDelay)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Test function to manually trigger a toast (for development)
  const testToast = useCallback(() => {
    const testNotification: ToastNotification = {
      id: `test-${Date.now()}`,
      user_id: userId || 'test',
      type: 'new_patch',
      title: 'Test Notification',
      body: 'This is a test notification to verify toasts are working.',
      priority: 5,
      game_id: null,
      patch_id: null,
      news_id: null,
      created_at: new Date().toISOString(),
      game: {
        id: 'test',
        name: 'Test Game',
        slug: 'test-game',
        cover_url: null,
      },
    }
    console.log('[ToastProvider] Showing test toast:', testNotification)
    showToast(testNotification)
    playNotificationSound()
  }, [userId, showToast])

  // Expose testToast on window for easy development testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { testToast: () => void }).testToast = testToast
    }
  }, [testToast])


  // Check for missed important content on mount (notifications + news)
  useEffect(() => {
    if (!userId || userId === 'guest') return

    // Only show once per session
    const sessionKey = 'patchpulse-missed-content-shown'
    if (sessionStorage.getItem(sessionKey)) return

    const checkMissedContent = async () => {
      const supabase = createClient()

      try {
        // Get unread high-priority notifications count
        const { count: unreadNotifications } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false)
          .gte('priority', 4)

        // Get last news visit time
        const { data: profile } = await supabase
          .from('profiles')
          .select('last_news_visit_at')
          .eq('id', userId)
          .single()

        // Get new news count since last visit
        let unreadNews = 0
        if (profile?.last_news_visit_at) {
          const { count } = await supabase
            .from('news_items')
            .select('id', { count: 'exact', head: true })
            .gte('published_at', profile.last_news_visit_at)

          unreadNews = count || 0
        }

        // Show summary toast if there's missed content
        const hasNotifications = (unreadNotifications || 0) > 0
        const hasNews = unreadNews > 0

        if (hasNotifications || hasNews) {
          const parts: string[] = []
          if (hasNotifications) {
            parts.push(`${unreadNotifications} important notification${unreadNotifications !== 1 ? 's' : ''}`)
          }
          if (hasNews) {
            parts.push(`${unreadNews} new article${unreadNews !== 1 ? 's' : ''}`)
          }

          const summaryToast: ToastNotification = {
            id: `missed-content-${Date.now()}`,
            user_id: userId,
            type: 'system',
            title: 'While you were away...',
            body: `You have ${parts.join(' and ')}`,
            priority: 4,
            game_id: null,
            patch_id: null,
            news_id: null,
            created_at: new Date().toISOString(),
            game: null,
          }

          // Small delay to let the app settle before showing
          setTimeout(() => {
            showToast(summaryToast)
            sessionStorage.setItem(sessionKey, 'true')
          }, 1500)
        }
      } catch (err) {
        console.error('[ToastProvider] Error checking missed content:', err)
      }
    }

    checkMissedContent()
  }, [userId, showToast])

  // Subscribe to real-time content updates (news, patches, notifications)
  useEffect(() => {
    const supabase = createClient()

    // Single channel for all content subscriptions
    const channel = supabase
      .channel('live-content-updates')
      // Subscribe to new patches
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'patch_notes',
        },
        async (payload) => {
          const patch = payload.new as { id: string; game_id: string; title: string; impact_score?: number }

          // Fetch game data
          let game = null
          if (patch.game_id) {
            const { data } = await supabase
              .from('games')
              .select('id, name, slug, cover_url')
              .eq('id', patch.game_id)
              .single()
            game = data
          }

          const notification: ToastNotification = {
            id: `patch-${patch.id}`,
            user_id: userId || 'anonymous',
            type: 'new_patch',
            title: patch.title || 'New Patch Available',
            body: game ? `${game.name} has been updated` : 'A game has been updated',
            priority: patch.impact_score && patch.impact_score >= 7 ? 5 : 4,
            game_id: patch.game_id,
            patch_id: patch.id,
            news_id: null,
            created_at: new Date().toISOString(),
            game,
          }

          showToast(notification)
          playNotificationSound()
        }
      )
      // Subscribe to new news
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'news_items',
        },
        async (payload) => {
          const news = payload.new as { id: string; game_id: string | null; title: string; source_name?: string }

          // Fetch game data if exists
          let game = null
          if (news.game_id) {
            const { data } = await supabase
              .from('games')
              .select('id, name, slug, cover_url')
              .eq('id', news.game_id)
              .single()
            game = data
          }

          const notification: ToastNotification = {
            id: `news-${news.id}`,
            user_id: userId || 'anonymous',
            type: 'new_news',
            title: news.title || 'Gaming News',
            body: news.source_name ? `From ${news.source_name}` : (game ? `News about ${game.name}` : 'New gaming news'),
            priority: 4,
            game_id: news.game_id,
            patch_id: null,
            news_id: news.id,
            created_at: new Date().toISOString(),
            game,
          }

          showToast(notification)
          playNotificationSound()
        }
      )
      // Subscribe to user notifications (for logged-in users)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        async (payload) => {
          const notification = payload.new as ToastNotification

          // Filter client-side for this user
          if (userId && notification.user_id !== userId) return

          // Fetch game data if game_id exists
          if (notification.game_id) {
            const { data: game } = await supabase
              .from('games')
              .select('id, name, slug, cover_url')
              .eq('id', notification.game_id)
              .single()

            notification.game = game
          }

          // Show toast only for high priority notifications (>= 4)
          if (notification.priority >= 4) {
            showToast(notification)
            playNotificationSound()
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true)
        } else if (status === 'CHANNEL_ERROR') {
          // Realtime not available - app still works, just no live toasts
          // This can happen if realtime is not enabled for tables in Supabase
          console.warn('[ToastProvider] Realtime unavailable - live notifications disabled')
        } else if (status === 'TIMED_OUT') {
          console.warn('[ToastProvider] Realtime connection timed out')
        }
        // Don't log CLOSED status - it's normal during cleanup
      })

    return () => {
      supabase.removeChannel(channel)
      setIsSubscribed(false)
    }
  }, [userId, showToast])

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, testToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast, index) => (
          <LiveToast
            key={toast.id}
            notification={toast}
            onDismiss={() => dismissToast(toast.id)}
            style={{
              transform: `translateY(${index * -8}px) scale(${1 - index * 0.02})`,
              opacity: 1 - index * 0.1,
              zIndex: 100 - index,
            }}
          />
        ))}
      </div>

      {/* Dev Test Button - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={testToast}
          className="fixed bottom-4 left-4 z-[200] px-3 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
        >
          Test Toast
        </button>
      )}
    </ToastContext.Provider>
  )
}

// Simple notification sound
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (e) {
    // Audio not supported or blocked
  }
}
