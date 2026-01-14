// Guest mode utilities
// Guests can browse content but cannot save/follow/bookmark anything

const GUEST_COOKIE_NAME = 'patchpulse-guest'
const GUEST_LOCALSTORAGE_KEY = 'patchpulse-guest'

// Guest plan limits - no features that require saving data
export const GUEST_LIMITS = {
  backlog: 0,
  followed: 0,
  hasNotifications: false,
  hasAISummaries: false,
  hasFullReleases: false,
  hasBookmarks: false,
} as const

// Check if guest mode is enabled (client-side)
export function isGuestMode(): boolean {
  if (typeof window === 'undefined') return false
  return document.cookie.includes(`${GUEST_COOKIE_NAME}=true`) ||
         sessionStorage.getItem(GUEST_LOCALSTORAGE_KEY) === 'true'
}

// Enable guest mode (client-side)
export function enableGuestMode(): void {
  if (typeof window === 'undefined') return
  // Set session cookie (expires when browser closes) - guest mode should not persist
  // This ensures users must explicitly choose guest mode each session
  document.cookie = `${GUEST_COOKIE_NAME}=true; path=/`
  // Also set sessionStorage instead of localStorage (for client-side checks in native apps)
  // Using sessionStorage ensures guest mode doesn't persist across sessions
  sessionStorage.setItem(GUEST_LOCALSTORAGE_KEY, 'true')
}

// Disable guest mode (client-side)
export function disableGuestMode(): void {
  if (typeof window === 'undefined') return
  document.cookie = `${GUEST_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  // Clear from both sessionStorage and localStorage (for backwards compatibility)
  sessionStorage.removeItem(GUEST_LOCALSTORAGE_KEY)
  localStorage.removeItem(GUEST_LOCALSTORAGE_KEY)
}

// Check guest mode from cookies (server-side)
export function isGuestModeFromCookies(cookies: { get: (name: string) => { value: string } | undefined }): boolean {
  const guestCookie = cookies.get(GUEST_COOKIE_NAME)
  return guestCookie?.value === 'true'
}
