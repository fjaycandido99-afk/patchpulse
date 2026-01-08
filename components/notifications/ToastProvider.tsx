'use client'

import { useEffect, useState, useCallback, createContext, useContext } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LiveToast } from './LiveToast'

type ToastNotification = {
  id: string
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

  // Debug: Log on every render
  console.log('[Toast] Provider rendered, userId:', userId)

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

  // Subscribe to real-time notifications
  useEffect(() => {
    // Skip for guest users or if already subscribed
    if (!userId || userId === 'guest' || isSubscribed) {
      console.log('[Toast] Skipping subscription:', { userId, isSubscribed })
      return
    }

    console.log('[Toast] Setting up Realtime subscription for user:', userId)
    const supabase = createClient()

    // Subscribe to new notifications for this user
    const channel = supabase
      .channel(`live-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          console.log('[Toast] Received notification:', payload.new)
          const notification = payload.new as ToastNotification

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
            console.log('[Toast] Showing high-priority toast:', notification.title)
            showToast(notification)
            playNotificationSound()
          } else {
            console.log('[Toast] Skipping low-priority notification:', notification.priority)
          }
        }
      )
      .subscribe((status, err) => {
        console.log('[Toast] Subscription status:', status, err || '')
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Toast] Channel error - Realtime may not be enabled for notifications table')
        }
      })

    return () => {
      console.log('[Toast] Cleaning up subscription')
      supabase.removeChannel(channel)
      setIsSubscribed(false)
    }
  }, [userId, isSubscribed, showToast])

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
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
