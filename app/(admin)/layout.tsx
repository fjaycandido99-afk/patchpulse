import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userEmail = user.email?.toLowerCase() || ''
  const isAdmin = ADMIN_EMAILS.includes(userEmail)

  if (!isAdmin) {
    redirect('/home')
  }

  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white antialiased min-h-screen">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6">
          {children}
        </div>
      </body>
    </html>
  )
}
