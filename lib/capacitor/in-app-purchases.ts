import { Capacitor } from '@capacitor/core'
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor'

// Product IDs - must match App Store Connect & RevenueCat
export const PRODUCT_IDS = {
  monthly: 'com.patchpulse.pro.monthly',
  yearly: 'com.patchpulse.pro.yearly',
} as const

type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS]

type Product = {
  id: string
  title: string
  description: string
  price: string
  priceString: string
}

type PurchaseResult = {
  success: boolean
  error?: string
}

let isInitialized = false

export function isIAPAvailable(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'
}

export async function initializeIAP(): Promise<boolean> {
  if (!isIAPAvailable()) return false
  if (isInitialized) return true

  try {
    const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY

    if (!apiKey) {
      console.error('RevenueCat API key not configured')
      return false
    }

    await Purchases.configure({
      apiKey,
    })

    // Set log level for debugging
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG })

    isInitialized = true
    return true
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error)
    return false
  }
}

export async function setUserId(userId: string): Promise<void> {
  if (!isInitialized) return

  try {
    await Purchases.logIn({ appUserID: userId })
  } catch (error) {
    console.error('Failed to set user ID:', error)
  }
}

export async function getProducts(): Promise<Product[]> {
  if (!isInitialized) return []

  try {
    const offerings = await Purchases.getOfferings()
    const products: Product[] = []

    const current = offerings.current
    if (current?.availablePackages) {
      for (const pkg of current.availablePackages) {
        products.push({
          id: pkg.product.identifier,
          title: pkg.product.title,
          description: pkg.product.description,
          price: pkg.product.price.toString(),
          priceString: pkg.product.priceString,
        })
      }
    }

    return products
  } catch (error) {
    console.error('Failed to get products:', error)
    return []
  }
}

export async function purchaseSubscription(productId: ProductId): Promise<PurchaseResult> {
  if (!isInitialized) {
    return { success: false, error: 'Store not initialized' }
  }

  try {
    const offerings = await Purchases.getOfferings()
    const current = offerings.current

    if (!current) {
      return { success: false, error: 'No offerings available' }
    }

    // Find the package with the matching product ID
    const pkg = current.availablePackages.find(
      p => p.product.identifier === productId
    )

    if (!pkg) {
      return { success: false, error: 'Product not found' }
    }

    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })

    // Check if purchase was successful
    const isActive = customerInfo.entitlements.active['PatchPulse Pro'] !== undefined

    return { success: isActive }
  } catch (error: any) {
    console.error('Purchase failed:', error)

    // Check if user cancelled
    if (error.code === '1' || error.userCancelled) {
      return { success: false, error: 'Purchase cancelled' }
    }

    return { success: false, error: error.message || 'Purchase failed' }
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!isInitialized) return false

  try {
    const { customerInfo } = await Purchases.restorePurchases()
    const isActive = customerInfo.entitlements.active['PatchPulse Pro'] !== undefined
    return isActive
  } catch (error) {
    console.error('Restore failed:', error)
    return false
  }
}

export async function getSubscriptionStatus(): Promise<{ isSubscribed: boolean; expiresAt?: Date }> {
  if (!isInitialized) {
    return { isSubscribed: false }
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo()
    const proEntitlement = customerInfo.entitlements.active['pro']

    if (proEntitlement) {
      return {
        isSubscribed: true,
        expiresAt: proEntitlement.expirationDate
          ? new Date(proEntitlement.expirationDate)
          : undefined,
      }
    }

    return { isSubscribed: false }
  } catch (error) {
    console.error('Failed to get subscription status:', error)
    return { isSubscribed: false }
  }
}
