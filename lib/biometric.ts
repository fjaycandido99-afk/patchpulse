'use client'

/**
 * Unified Biometric API
 * Uses native Capacitor biometric on iOS/Android, WebAuthn on web
 */

import * as webauthn from './webauthn'
import * as nativeBiometric from './capacitor/biometric'
import { createClient } from './supabase/client'

// Check if running in native app
function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
}

/**
 * Check if biometric authentication is available
 */
export async function checkBiometricAvailable(): Promise<boolean> {
  if (isNativePlatform()) {
    const result = await nativeBiometric.isBiometricAvailable()
    return result.available
  }
  return webauthn.checkBiometricAvailable()
}

/**
 * Get the type of biometric available (Face ID, Touch ID, etc.)
 */
export async function getBiometricType(): Promise<string> {
  if (isNativePlatform()) {
    const result = await nativeBiometric.isBiometricAvailable()
    return result.biometryType
  }
  return 'Biometric' // WebAuthn doesn't provide specific type
}

/**
 * Check if user has biometric enabled
 */
export function hasStoredCredential(): boolean {
  if (isNativePlatform()) {
    return nativeBiometric.isBiometricEnabled()
  }
  return webauthn.hasStoredCredential()
}

/**
 * Get stored email for biometric login
 */
export function getStoredEmail(): string | null {
  if (isNativePlatform()) {
    // Native stores email with credentials, we can't access it without biometric
    // Return from localStorage if we stored it during enable
    if (typeof window === 'undefined') return null
    return localStorage.getItem('patchpulse-biometric-email')
  }
  return webauthn.getStoredEmail()
}

/**
 * Register/enable biometric authentication
 * For native: stores refresh token in secure storage
 * For web: registers WebAuthn credential with server
 */
export async function registerBiometric(): Promise<{
  success: boolean
  error?: string
}> {
  if (isNativePlatform()) {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.refresh_token || !session?.user?.email) {
        return { success: false, error: 'No active session' }
      }

      const success = await nativeBiometric.enableBiometricLogin(
        session.user.email,
        session.refresh_token
      )

      if (success) {
        // Store email for display purposes
        localStorage.setItem('patchpulse-biometric-email', session.user.email)
        return { success: true }
      }

      return { success: false, error: 'Failed to enable biometric login' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to enable biometric' }
    }
  }

  return webauthn.registerBiometric()
}

/**
 * Authenticate using biometric
 * For native: verifies Face ID and uses stored refresh token
 * For web: uses WebAuthn to authenticate with server
 */
export async function authenticateWithBiometric(): Promise<{
  success: boolean
  error?: string
}> {
  if (isNativePlatform()) {
    try {
      const credentials = await nativeBiometric.authenticateWithBiometric()

      if (!credentials) {
        return { success: false, error: 'Authentication cancelled or failed' }
      }

      // Use the refresh token to establish a session
      const supabase = createClient()
      const { error } = await supabase.auth.setSession({
        access_token: '', // Will be refreshed
        refresh_token: credentials.refreshToken,
      })

      if (error) {
        // Token may be expired, clear biometric
        if (error.message?.includes('invalid') || error.message?.includes('expired')) {
          await nativeBiometric.disableBiometricLogin()
          localStorage.removeItem('patchpulse-biometric-email')
          return { success: false, error: 'Session expired. Please log in with password.' }
        }
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Biometric authentication failed' }
    }
  }

  return webauthn.authenticateWithBiometric()
}

/**
 * Remove/disable biometric authentication
 */
export async function removeBiometric(): Promise<{
  success: boolean
  error?: string
}> {
  if (isNativePlatform()) {
    try {
      await nativeBiometric.disableBiometricLogin()
      localStorage.removeItem('patchpulse-biometric-email')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to disable biometric' }
    }
  }

  return webauthn.removeBiometric()
}

/**
 * Update stored refresh token (call after session refresh)
 */
export async function updateStoredToken(): Promise<void> {
  if (!isNativePlatform()) return

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.refresh_token && session?.user?.email) {
    await nativeBiometric.updateStoredRefreshToken(
      session.user.email,
      session.refresh_token
    )
  }
}

/**
 * Clear stored credential (on logout)
 */
export function clearStoredCredential(): void {
  if (isNativePlatform()) {
    nativeBiometric.disableBiometricLogin()
    localStorage.removeItem('patchpulse-biometric-email')
  } else {
    webauthn.clearStoredCredential()
  }
}
