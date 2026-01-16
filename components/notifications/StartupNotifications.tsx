'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, FileText, Calendar, ChevronRight } from 'lucide-react'

type StartupNotification = {
  id: string
  type: 'new_patches' | 'upcoming_release'
  title: string
  message: string
  href: string
  icon: 'patches' | 'release'
}

const LAST_VISIT_KEY = 'patchpulse_last_visit'
const SHOWN_RELEASES_KEY = 'patchpulse_shown_releases'
const SESSION_KEY = 'patchpulse_session_notifs_shown'

export function StartupNotifications() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<StartupNotification[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return

    // Check if we've already shown notifications this session
    const sessionShown = sessionStorage.getItem(SESSION_KEY)
    if (sessionShown) return

    // Mark session as having shown notifications
    sessionStorage.setItem(SESSION_KEY, 'true')

    const checkNotifications = async () => {
      const notifs: StartupNotification[] = []

      // Get last visit time
      const lastVisit = localStorage.getItem(LAST_VISIT_KEY)
      const lastVisitDate = lastVisit ? new Date(lastVisit) : new Date(Date.now() - 24 * 60 * 60 * 1000) // Default to 24h ago

      // Update last visit time
      localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString())

      try {
        // Check for new patches
        const patchesRes = await fetch(`/api/startup/new-patches?since=${lastVisitDate.toISOString()}`)
        if (patchesRes.ok) {
          const patchesData = await patchesRes.json()
          if (patchesData.count > 0) {
            notifs.push({
              id: 'new-patches',
              type: 'new_patches',
              title: 'New Patches',
              message: `${patchesData.count} new patch${patchesData.count > 1 ? 'es' : ''} for your games`,
              href: '/patches?filter=your_patches',
              icon: 'patches',
            })
          }
        }

        // Check for upcoming releases
        const releasesRes = await fetch('/api/startup/upcoming-releases')
        if (releasesRes.ok) {
          const releasesData = await releasesRes.json()

          // Filter out already shown releases
          const shownReleases = JSON.parse(localStorage.getItem(SHOWN_RELEASES_KEY) || '[]')
          const newReleases = releasesData.releases?.filter(
            (r: { id: string }) => !shownReleases.includes(r.id)
          ) || []

          if (newReleases.length > 0) {
            const release = newReleases[0] // Show the closest one
            notifs.push({
              id: `release-${release.id}`,
              type: 'upcoming_release',
              title: 'Upcoming Release',
              message: `${release.name} releases ${release.daysUntil === 0 ? 'today!' : release.daysUntil === 1 ? 'tomorrow!' : `in ${release.daysUntil} days`}`,
              href: `/games/${release.slug}`,
              icon: 'release',
            })

            // Mark as shown
            localStorage.setItem(
              SHOWN_RELEASES_KEY,
              JSON.stringify([...shownReleases, release.id])
            )
          }
        }
      } catch (error) {
        console.error('Failed to check startup notifications:', error)
      }

      if (notifs.length > 0) {
        setNotifications(notifs)
        setIsVisible(true)

        // Auto-hide after 5 seconds
        setTimeout(() => {
          setIsVisible(false)
        }, 5000)
      }
    }

    // Delay check to not block initial render
    const timeout = setTimeout(checkNotifications, 1500)
    return () => clearTimeout(timeout)
  }, [])

  const handleClick = (notif: StartupNotification) => {
    setNotifications(prev => prev.filter(n => n.id !== notif.id))
    router.push(notif.href)
  }

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (!isVisible || notifications.length === 0) return null

  return (
    <div className="fixed top-16 right-4 z-[199] flex flex-col gap-2 max-w-sm">
      {notifications.slice(0, 3).map((notif) => (
        <div
          key={notif.id}
          onClick={() => handleClick(notif)}
          className="group cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md animate-in slide-in-from-right duration-300 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 hover:border-primary/50 hover:from-primary/15 hover:to-primary/10 transition-all"
        >
          <div className="p-2 rounded-lg bg-primary/20">
            {notif.icon === 'patches' ? (
              <FileText className="w-5 h-5 text-primary" />
            ) : (
              <Calendar className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{notif.title}</p>
            <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <button
            onClick={(e) => handleDismiss(e, notif.id)}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  )
}
