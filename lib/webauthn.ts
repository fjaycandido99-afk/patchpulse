import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from '@simplewebauthn/browser'
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser'

const CREDENTIAL_KEY = 'patchpulse_biometric_credential'
const USER_EMAIL_KEY = 'patchpulse_biometric_email'

/**
 * Check if WebAuthn is supported and platform authenticator available
 */
export async function checkBiometricAvailable(): Promise<boolean> {
  if (!browserSupportsWebAuthn()) {
    return false
  }

  try {
    return await platformAuthenticatorIsAvailable()
  } catch {
    return false
  }
}

/**
 * Check if user has a stored biometric credential
 */
export function hasStoredCredential(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(CREDENTIAL_KEY)
}

/**
 * Get stored credential ID
 */
export function getStoredCredentialId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CREDENTIAL_KEY)
}

/**
 * Get stored email for biometric login
 */
export function getStoredEmail(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USER_EMAIL_KEY)
}

/**
 * Store credential ID and email after successful registration
 */
export function storeCredential(credentialId: string, email: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CREDENTIAL_KEY, credentialId)
  localStorage.setItem(USER_EMAIL_KEY, email)
}

/**
 * Clear stored credential (on logout or disable)
 */
export function clearStoredCredential(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CREDENTIAL_KEY)
  localStorage.removeItem(USER_EMAIL_KEY)
}

/**
 * Register a new biometric credential
 */
export async function registerBiometric(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Get registration options from server
    const optionsRes = await fetch('/api/auth/webauthn/register/options', {
      method: 'POST',
      credentials: 'include',
    })

    if (!optionsRes.ok) {
      const data = await optionsRes.json()
      return { success: false, error: data.error || 'Failed to get registration options' }
    }

    const options: PublicKeyCredentialCreationOptionsJSON = await optionsRes.json()

    // Start WebAuthn registration ceremony
    const credential = await startRegistration({ optionsJSON: options })

    // Verify with server
    const verifyRes = await fetch('/api/auth/webauthn/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credential),
    })

    if (!verifyRes.ok) {
      const data = await verifyRes.json()
      return { success: false, error: data.error || 'Failed to verify registration' }
    }

    const result = await verifyRes.json()

    // Store credential ID locally
    if (result.credentialId && result.email) {
      storeCredential(result.credentialId, result.email)
    }

    return { success: true }
  } catch (error: any) {
    // User cancelled or error
    if (error.name === 'NotAllowedError') {
      return { success: false, error: 'Biometric registration was cancelled' }
    }
    return { success: false, error: error.message || 'Registration failed' }
  }
}

/**
 * Authenticate using biometric
 */
export async function authenticateWithBiometric(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const email = getStoredEmail()
    if (!email) {
      return { success: false, error: 'No stored credential found' }
    }

    // Get authentication options from server
    const optionsRes = await fetch('/api/auth/webauthn/login/options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!optionsRes.ok) {
      const data = await optionsRes.json()
      return { success: false, error: data.error || 'Failed to get authentication options' }
    }

    const options: PublicKeyCredentialRequestOptionsJSON = await optionsRes.json()

    // Start WebAuthn authentication ceremony
    const credential = await startAuthentication({ optionsJSON: options })

    // Verify with server
    const verifyRes = await fetch('/api/auth/webauthn/login/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, credential }),
    })

    if (!verifyRes.ok) {
      const data = await verifyRes.json()
      return { success: false, error: data.error || 'Authentication failed' }
    }

    return { success: true }
  } catch (error: any) {
    // User cancelled or error
    if (error.name === 'NotAllowedError') {
      return { success: false, error: 'Biometric authentication was cancelled' }
    }
    return { success: false, error: error.message || 'Authentication failed' }
  }
}

/**
 * Remove biometric credential from server and local storage
 */
export async function removeBiometric(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const res = await fetch('/api/auth/webauthn/remove', {
      method: 'POST',
      credentials: 'include',
    })

    if (!res.ok) {
      const data = await res.json()
      return { success: false, error: data.error || 'Failed to remove credential' }
    }

    clearStoredCredential()
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove credential' }
  }
}
