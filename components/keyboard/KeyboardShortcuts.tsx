'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  X,
  ArrowUp,
  ArrowDown,
  Bookmark,
  Home,
  FileText,
  Newspaper,
  CornerDownLeft,
} from 'lucide-react'

// Keyboard navigation item selector
const NAV_ITEM_SELECTOR = '[data-keyboard-nav]'
const BOOKMARK_BTN_SELECTOR = '[data-bookmark-btn]'

// Detect OS for showing correct key symbols
function getOS(): 'mac' | 'windows' {
  if (typeof window === 'undefined') return 'windows'
  return navigator.platform.toLowerCase().includes('mac') ? 'mac' : 'windows'
}

export function KeyboardShortcuts() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [isBrowser, setIsBrowser] = useState(false)
  const [os, setOS] = useState<'mac' | 'windows'>('windows')
  const router = useRouter()
  const pathname = usePathname()

  // Check if we're in a browser (not Capacitor native app) and detect OS
  useEffect(() => {
    const isNative = typeof window !== 'undefined' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsBrowser(!isNative)
    setOS(getOS())
  }, [])

  // Reset focus when route changes
  useEffect(() => {
    setFocusedIndex(-1)
  }, [pathname])

  // Get all navigable items
  const getNavItems = useCallback(() => {
    return Array.from(document.querySelectorAll(NAV_ITEM_SELECTOR)) as HTMLElement[]
  }, [])

  // Scroll focused item into view and highlight it
  const focusItem = useCallback((index: number) => {
    const items = getNavItems()
    if (index < 0 || index >= items.length) return

    // Remove focus from all items
    items.forEach(item => {
      item.classList.remove('keyboard-focused')
    })

    // Add focus to selected item
    const item = items[index]
    item.classList.add('keyboard-focused')
    item.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setFocusedIndex(index)
  }, [getNavItems])

  // Navigate to focused item
  const activateItem = useCallback(() => {
    const items = getNavItems()
    if (focusedIndex < 0 || focusedIndex >= items.length) return

    const item = items[focusedIndex]
    // If it's a link, click it
    if (item.tagName === 'A') {
      item.click()
    } else {
      // Try to find and click a link inside
      const link = item.querySelector('a')
      if (link) link.click()
    }
  }, [getNavItems, focusedIndex])

  // Toggle bookmark on focused item
  const bookmarkItem = useCallback(() => {
    const items = getNavItems()
    if (focusedIndex < 0 || focusedIndex >= items.length) return

    const item = items[focusedIndex]
    const bookmarkBtn = item.querySelector(BOOKMARK_BTN_SELECTOR) as HTMLButtonElement
    if (bookmarkBtn) {
      bookmarkBtn.click()
    }
  }, [getNavItems, focusedIndex])

  // Handle keyboard events
  useEffect(() => {
    if (!isBrowser) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Ignore if a modal is open (command palette, search, etc.)
      if (document.querySelector('.command-palette-overlay, .search-overlay')) {
        return
      }

      const items = getNavItems()

      switch (e.key) {
        // Help modal
        case '?':
          e.preventDefault()
          setIsHelpOpen(true)
          break

        // Navigation - J (down) / K (up)
        case 'j':
        case 'J':
          e.preventDefault()
          if (items.length > 0) {
            const nextIndex = focusedIndex < 0 ? 0 : Math.min(focusedIndex + 1, items.length - 1)
            focusItem(nextIndex)
          }
          break

        case 'k':
        case 'K':
          e.preventDefault()
          if (items.length > 0) {
            const prevIndex = focusedIndex < 0 ? 0 : Math.max(focusedIndex - 1, 0)
            focusItem(prevIndex)
          }
          break

        // Activate/open with Enter or O
        case 'Enter':
        case 'o':
        case 'O':
          if (focusedIndex >= 0) {
            e.preventDefault()
            activateItem()
          }
          break

        // Bookmark with B
        case 'b':
        case 'B':
          if (focusedIndex >= 0) {
            e.preventDefault()
            bookmarkItem()
          }
          break

        // Quick navigation with G prefix
        case 'g':
        case 'G':
          // Will be handled by second key press
          break

        // Page navigation shortcuts
        case 'h':
        case 'H':
          if (e.shiftKey) {
            e.preventDefault()
            router.push('/home')
          }
          break

        case 'p':
        case 'P':
          if (e.shiftKey) {
            e.preventDefault()
            router.push('/patches')
          }
          break

        case 'n':
        case 'N':
          if (e.shiftKey) {
            e.preventDefault()
            router.push('/news')
          }
          break

        // Escape to clear focus
        case 'Escape':
          if (focusedIndex >= 0) {
            e.preventDefault()
            const items = getNavItems()
            items.forEach(item => item.classList.remove('keyboard-focused'))
            setFocusedIndex(-1)
          }
          if (isHelpOpen) {
            e.preventDefault()
            setIsHelpOpen(false)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isBrowser, focusedIndex, isHelpOpen, getNavItems, focusItem, activateItem, bookmarkItem, router])

  // Don't render on native apps
  if (!isBrowser) return null

  return (
    <>
      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsHelpOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md bg-[#0a0f1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Navigation */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Navigation
                </h3>
                <div className="space-y-1.5">
                  <ShortcutRow keys={['J']} description="Move down" icon={<ArrowDown className="w-3.5 h-3.5" />} />
                  <ShortcutRow keys={['K']} description="Move up" icon={<ArrowUp className="w-3.5 h-3.5" />} />
                  <ShortcutRow keys={['Enter']} description="Open selected" icon={<CornerDownLeft className="w-3.5 h-3.5" />} />
                  <ShortcutRow keys={['Esc']} description="Clear selection" />
                </div>
              </section>

              {/* Actions */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Actions
                </h3>
                <div className="space-y-1.5">
                  <ShortcutRow keys={['B']} description="Bookmark selected" icon={<Bookmark className="w-3.5 h-3.5" />} />
                  <ShortcutRow keys={os === 'mac' ? ['⌘', 'K'] : ['Ctrl', 'K']} description="Command palette" />
                </div>
              </section>

              {/* Go to pages */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Go to Page
                </h3>
                <div className="space-y-1.5">
                  <ShortcutRow keys={os === 'mac' ? ['⇧', 'H'] : ['Shift', 'H']} description="Home" icon={<Home className="w-3.5 h-3.5" />} />
                  <ShortcutRow keys={os === 'mac' ? ['⇧', 'P'] : ['Shift', 'P']} description="Patches" icon={<FileText className="w-3.5 h-3.5" />} />
                  <ShortcutRow keys={os === 'mac' ? ['⇧', 'N'] : ['Shift', 'N']} description="News" icon={<Newspaper className="w-3.5 h-3.5" />} />
                </div>
              </section>

              {/* General */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  General
                </h3>
                <div className="space-y-1.5">
                  <ShortcutRow keys={['?']} description="Show this help" />
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/10 bg-white/[0.02]">
              <p className="text-xs text-muted-foreground text-center">
                Desktop browser only · Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">?</kbd> anytime
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Shortcut row component
function ShortcutRow({
  keys,
  description,
  icon,
}: {
  keys: string[]
  description: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-sm text-foreground/90">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {description}
      </div>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="min-w-[24px] px-1.5 py-1 rounded bg-white/10 text-xs font-medium text-center"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  )
}
