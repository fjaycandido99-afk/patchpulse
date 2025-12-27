'use client'

import { Capacitor } from '@capacitor/core'

// RevenueCat types
type CustomerInfo = {
  activeSubscriptions: string[]
  entitlements: {
    active: Record<string, {
      identifier: string
      productIdentifier: string
      expirationDate: string | null
      isActive: boolean
    }>
  }
  originalAppUserId: string
}

type PurchasesPackage = {
  identifier: string
  product: {
    identifier: string
    priceString: string
    price: number
    title: string
    description: string
  }
}

// Check if running in Capacitor (native iOS/Android)
export function isNative(): boolean {
  return Capacitor.isNativePlatform()
}

// Check if running on iOS
export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios'
}

// Dynamic import to avoid loading on web
async function getPurchases() {
  if (!isNative()) {
    throw new Error('Purchases only available on native platforms')
  }
  const { Purchases } = await import('@revenuecat/purchases-capacitor')
  return Purchases
}

/**
 * Initialize RevenueCat - call this on app startup
 */
export async function initializePurchases(userId?: string): Promise<void> {
  if (!isNative()) return

  try {
    const Purchases = await getPurchases()

    await Purchases.configure({
      apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || '',
      appUserID: userId,
    })

    console.log('RevenueCat initialized')
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error)
  }
}

/**
 * Get available subscription packages
 */
export async function getOfferings(): Promise<PurchasesPackage[]> {
  if (!isNative()) return []

  try {
    const Purchases = await getPurchases()
    const offerings = await Purchases.getOfferings()

    if (offerings.current?.availablePackages) {
      return offerings.current.availablePackages.map(pkg => ({
        identifier: pkg.identifier,
        product: {
          identifier: pkg.product.identifier,
          priceString: pkg.product.priceString,
          price: pkg.product.price,
          title: pkg.product.title,
          description: pkg.product.description,
        },
      }))
    }
    return []
  } catch (error) {
    console.error('Failed to get offerings:', error)
    return []
  }
}

/**
 * Purchase a subscription package
 */
export async function purchasePackage(packageId: string): Promise<{
  success: boolean
  customerInfo?: CustomerInfo
  error?: string
}> {
  if (!isNative()) {
    return { success: false, error: 'Not available on web' }
  }

  try {
    const Purchases = await getPurchases()
    const offerings = await Purchases.getOfferings()

    const pkg = offerings.current?.availablePackages.find(
      p => p.identifier === packageId
    )

    if (!pkg) {
      return { success: false, error: 'Package not found' }
    }

    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })

    // Sync with your backend
    await syncSubscriptionWithBackend(customerInfo)

    return { success: true, customerInfo: formatCustomerInfo(customerInfo) }
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, error: 'Purchase cancelled' }
    }
    console.error('Purchase failed:', error)
    return { success: false, error: error.message || 'Purchase failed' }
  }
}

/**
 * RESTORE PURCHASES - Apple requirement
 * This works without app login - uses Apple ID from device
 */
export async function restorePurchases(): Promise<{
  success: boolean
  customerInfo?: CustomerInfo
  error?: string
}> {
  if (!isNative()) {
    // On web, fall back to the web restore API
    return restorePurchasesWeb()
  }

  try {
    const Purchases = await getPurchases()
    const { customerInfo } = await Purchases.restorePurchases()

    // Check if user has active entitlements
    const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0

    if (hasActiveSubscription) {
      // Sync with your backend
      await syncSubscriptionWithBackend(customerInfo)

      return {
        success: true,
        customerInfo: formatCustomerInfo(customerInfo)
      }
    }

    return {
      success: false,
      error: 'No active subscriptions found for this Apple ID'
    }
  } catch (error: any) {
    console.error('Restore failed:', error)
    return { success: false, error: error.message || 'Restore failed' }
  }
}

/**
 * Web fallback for restore - checks database
 */
async function restorePurchasesWeb(): Promise<{
  success: boolean
  customerInfo?: CustomerInfo
  error?: string
}> {
  try {
    const response = await fetch('/api/subscriptions/restore', {
      method: 'POST',
      credentials: 'include',
    })

    const data = await response.json()

    if (data.restored) {
      return { success: true }
    }

    return {
      success: false,
      error: data.message || 'No purchases to restore'
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Restore failed' }
  }
}

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus(): Promise<{
  isSubscribed: boolean
  expirationDate?: string
  productId?: string
}> {
  if (!isNative()) {
    return { isSubscribed: false }
  }

  try {
    const Purchases = await getPurchases()
    const { customerInfo } = await Purchases.getCustomerInfo()

    const proEntitlement = customerInfo.entitlements.active['pro']

    if (proEntitlement?.isActive) {
      return {
        isSubscribed: true,
        expirationDate: proEntitlement.expirationDate || undefined,
        productId: proEntitlement.productIdentifier,
      }
    }

    return { isSubscribed: false }
  } catch (error) {
    console.error('Failed to get subscription status:', error)
    return { isSubscribed: false }
  }
}

/**
 * Sync RevenueCat subscription with your backend
 */
async function syncSubscriptionWithBackend(customerInfo: any): Promise<void> {
  try {
    const proEntitlement = customerInfo.entitlements.active['pro']

    if (!proEntitlement) return

    // Send subscription info to your backend
    await fetch('/api/subscriptions/apple/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        originalAppUserId: customerInfo.originalAppUserId,
        productId: proEntitlement.productIdentifier,
        expirationDate: proEntitlement.expirationDate,
        isActive: proEntitlement.isActive,
      }),
    })
  } catch (error) {
    console.error('Failed to sync with backend:', error)
  }
}

/**
 * Format customer info for consistency
 */
function formatCustomerInfo(info: any): CustomerInfo {
  return {
    activeSubscriptions: info.activeSubscriptions || [],
    entitlements: {
      active: Object.fromEntries(
        Object.entries(info.entitlements?.active || {}).map(([key, val]: [string, any]) => [
          key,
          {
            identifier: val.identifier,
            productIdentifier: val.productIdentifier,
            expirationDate: val.expirationDate,
            isActive: val.isActive,
          },
        ])
      ),
    },
    originalAppUserId: info.originalAppUserId,
  }
}

/**
 * Log in user to RevenueCat (after app login)
 */
export async function loginUser(userId: string): Promise<void> {
  if (!isNative()) return

  try {
    const Purchases = await getPurchases()
    await Purchases.logIn({ appUserID: userId })
  } catch (error) {
    console.error('RevenueCat login failed:', error)
  }
}

/**
 * Log out user from RevenueCat (on app logout)
 */
export async function logoutUser(): Promise<void> {
  if (!isNative()) return

  try {
    const Purchases = await getPurchases()
    await Purchases.logOut()
  } catch (error) {
    console.error('RevenueCat logout failed:', error)
  }
}
