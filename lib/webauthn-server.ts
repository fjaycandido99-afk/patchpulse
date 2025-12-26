import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server'

// Relying Party configuration
const rpName = 'PatchPulse'
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost'
const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export type StoredCredential = {
  id: string
  credentialId: string
  publicKey: string
  counter: number
  transports?: AuthenticatorTransportFuture[]
  deviceName?: string
}

/**
 * Generate registration options for a new credential
 */
export async function getRegistrationOptions(
  userId: string,
  userEmail: string,
  existingCredentials: StoredCredential[] = []
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new TextEncoder().encode(userId),
    userName: userEmail,
    userDisplayName: userEmail.split('@')[0],
    // Don't prompt user for additional authenticators if they already have one
    excludeCredentials: existingCredentials.map((cred) => ({
      id: cred.credentialId,
      transports: cred.transports,
    })),
    authenticatorSelection: {
      // Prefer platform authenticators (Face ID, Touch ID, Windows Hello)
      authenticatorAttachment: 'platform',
      // Require user verification (biometric or PIN)
      userVerification: 'required',
      // Single device credential (not synced across devices)
      residentKey: 'preferred',
    },
    // Timeout: 5 minutes
    timeout: 300000,
  })

  return options
}

/**
 * Verify registration response from browser
 */
export async function verifyRegistration(
  response: RegistrationResponseJSON,
  expectedChallenge: string
): Promise<VerifiedRegistrationResponse> {
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
  })

  return verification
}

/**
 * Generate authentication options for login
 */
export async function getAuthenticationOptions(
  credentials: StoredCredential[]
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'required',
    timeout: 300000,
    allowCredentials: credentials.map((cred) => ({
      id: cred.credentialId,
      transports: cred.transports,
    })),
  })

  return options
}

/**
 * Verify authentication response from browser
 */
export async function verifyAuthentication(
  response: AuthenticationResponseJSON,
  expectedChallenge: string,
  credential: StoredCredential
): Promise<VerifiedAuthenticationResponse> {
  // Decode the base64url public key back to Uint8Array
  const publicKeyBuffer = Buffer.from(credential.publicKey, 'base64url')

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
    credential: {
      id: credential.credentialId,
      publicKey: new Uint8Array(publicKeyBuffer),
      counter: credential.counter,
    },
  })

  return verification
}

/**
 * Encode credential public key for storage
 */
export function encodePublicKey(publicKey: Uint8Array): string {
  return Buffer.from(publicKey).toString('base64url')
}

/**
 * Get device name from user agent
 */
export function getDeviceName(userAgent: string): string {
  if (/iPhone/i.test(userAgent)) return 'iPhone'
  if (/iPad/i.test(userAgent)) return 'iPad'
  if (/Mac/i.test(userAgent)) return 'Mac'
  if (/Android/i.test(userAgent)) return 'Android'
  if (/Windows/i.test(userAgent)) return 'Windows'
  return 'Unknown Device'
}

export { rpID, rpName, origin }
