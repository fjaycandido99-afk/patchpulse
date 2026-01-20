import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await getSession()
  const cookieStore = await cookies()

  // Check if this is a native app - they handle auth client-side via localStorage
  const isNativeApp = cookieStore.get('patchpulse-native-app')?.value === 'true'

  // For native apps, allow access without server-side session check
  // The client-side NativeAuthGuard will handle auth
  if (!user && !isNativeApp) {
    redirect('/login')
  }

  return <>{children}</>
}
