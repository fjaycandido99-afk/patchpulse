import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { MobileNav } from '@/components/layout/MobileNav'
import { DesktopSidebar } from '@/components/layout/DesktopSidebar'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await getSession()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (error || !profile || !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="flex min-h-screen">
      <DesktopSidebar />

      <main className="flex-1 pb-20 md:ml-64 md:pb-0">
        <div className="mx-auto h-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
