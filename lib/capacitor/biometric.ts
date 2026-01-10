'use client'

import { NativeBiometric, BiometryType } from '@capgo/capacitor-native-biometric'

const BIOMETRIC_KEY = 'patchpulse-biometric-enabled'
const CREDENTIALS_SERVER = 'patchpulse.app'

// Check if running in native app
function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
}

// Check if biometric auth is available on this device
export async function isBiometricAvailable(): Promise<{ available: boolean; biometryType: string }> {
  if (!isNativePlatform()) {
    return { available: false, biometryType: 'none' }
  }

  try {
    const result = await NativeBiometric.isAvailable()
    const biometryType = result.biometryType === BiometryType.FACE_ID
      ? 'Face ID'
      : result.biometryType === BiometryType.TOUCH_ID
        ? 'Touch ID'
        : result.biometryType === BiometryType.FINGERPRINT
          ? 'Fingerprint'
          : 'Biometric'

    return {
      available: result.isAvailable,
      biometryType
    }
  } catch (error) {
    console.error('Biometric check failed:', error)
    return { available: false, biometryType: 'none' }
  }
}

// Check if user has enabled biometric login
export function isBiometricEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(BIOMETRIC_KEY) === 'true'
}

// Enable biometric login and store credentials
export async function enableBiometricLogin(email: string, refreshToken: string): Promise<boolean> {
  if (!isNativePlatform()) return false

  try {
    // Verify biometric first
    await NativeBiometric.verifyIdentity({
      reason: 'Enable Face ID / Touch ID for quick login',
      title: 'Enable Biometric Login',
      subtitle: 'Authenticate to enable',
      description: 'Use your biometric to quickly sign in next time',
    })

    // Store credentials securely in the device's secure storage
    await NativeBiometric.setCredentials({
      username: email,
      password: refreshToken,
      server: CREDENTIALS_SERVER,
    })

    // Mark biometric as enabled
    localStorage.setItem(BIOMETRIC_KEY, 'true')

    return true
  } catch (error) {
    console.error('Failed to enable biometric login:', error)
    return false
  }
}

// Disable biometric login
export async function disableBiometricLogin(): Promise<void> {
  localStorage.removeItem(BIOMETRIC_KEY)

  if (!isNativePlatform()) return

  try {
    await NativeBiometric.deleteCredentials({
      server: CREDENTIALS_SERVER,
    })
  } catch (error) {
    // Credentials may not exist
    console.log('No credentials to delete')
  }
}

// Authenticate with biometric and get stored credentials
export async function authenticateWithBiometric(): Promise<{ email: string; refreshToken: string } | null> {
  if (!isNativePlatform() || !isBiometricEnabled()) {
    return null
  }

  try {
    // Verify biometric identity
    await NativeBiometric.verifyIdentity({
      reason: 'Sign in to PatchPulse',
      title: 'Sign In',
      subtitle: 'Use Face ID / Touch ID',
      description: 'Authenticate to access your account',
    })

    // Get stored credentials
    const credentials = await NativeBiometric.getCredentials({
      server: CREDENTIALS_SERVER,
    })

    if (credentials.username && credentials.password) {
      return {
        email: credentials.username,
        refreshToken: credentials.password,
      }
    }

    return null
  } catch (error) {
    console.error('Biometric authentication failed:', error)
    return null
  }
}

// Update stored refresh token (call after token refresh)
export async function updateStoredRefreshToken(email: string, refreshToken: string): Promise<void> {
  if (!isNativePlatform() || !isBiometricEnabled()) return

  try {
    await NativeBiometric.setCredentials({
      username: email,
      password: refreshToken,
      server: CREDENTIALS_SERVER,
    })
  } catch (error) {
    console.error('Failed to update stored credentials:', error)
  }
}
