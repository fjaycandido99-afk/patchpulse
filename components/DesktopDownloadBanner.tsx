'use client'

import { useEffect, useState } from 'react'
import { X, Download, Monitor, Smartphone } from 'lucide-react'
import Image from 'next/image'

const APP_STORE_URL = 'https://apps.apple.com/app/patchpulse/id6757092034'
const DISMISSED_KEY = 'patchpulse_download_banner_dismissed'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function DesktopDownloadBanner() {
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [browser, setBrowser] = useState<'chrome' | 'safari' | 'other'>('other')

  useEffect(() => {
    setMounted(true)

    // Check if we're in native app
    const isNative = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    if (isNative) return

    // Check if on mobile - don't show on mobile browsers
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) return

    // Check if already running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    // Detect browser
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('chrome') && !ua.includes('edg')) {
      setBrowser('chrome')
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      setBrowser('safari')
    }

    // Check if already dismissed
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return
      }
    }

    // Listen for PWA install prompt (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show banner after a short delay
    const timer = setTimeout(() => setShow(true), 3000)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem(DISMISSED_KEY, Date.now().toString())
  }

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShow(false)
        localStorage.setItem(DISMISSED_KEY, Date.now().toString())
      }
      setDeferredPrompt(null)
    }
  }

  if (!mounted || !show) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 max-w-sm">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-3">
          {/* App icon */}
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
            <Image
              src="/logo.png"
              alt="PatchPulse"
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-semibold text-sm">Install PatchPulse</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Get the app for a better experience with notifications
            </p>

            <div className="flex flex-col gap-2 mt-3">
              {/* PWA Install button (Chrome/Edge) */}
              {deferredPrompt && (
                <button
                  onClick={handleInstallPWA}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Monitor className="h-4 w-4" />
                  Install Desktop App
                </button>
              )}

              {/* Safari instructions */}
              {browser === 'safari' && !deferredPrompt && (
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                  <p className="font-medium text-foreground mb-1">To install on Safari:</p>
                  <p>Click <span className="font-medium">File → Add to Dock</span></p>
                </div>
              )}

              {/* Chrome instructions if no prompt available */}
              {browser === 'chrome' && !deferredPrompt && (
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                  <p className="font-medium text-foreground mb-1">To install on Chrome:</p>
                  <p>Click the install icon <Download className="h-3 w-3 inline" /> in the address bar</p>
                </div>
              )}

              {/* iOS App Store link */}
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg text-xs font-semibold hover:bg-zinc-700 transition-colors"
              >
                <Smartphone className="h-4 w-4" />
                Get iOS App
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
