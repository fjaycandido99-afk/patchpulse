import { createClient } from '@/lib/supabase/server'
import { grantProAccess } from '@/lib/subscriptions/limits'
import { NextResponse } from 'next/server'

// Development-only endpoint to grant Pro access for testing
export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const success = await grantProAccess(user.id, 365, 'development_testing')

  if (success) {
    return NextResponse.json({
      success: true,
      message: 'Pro access granted for 365 days',
      userId: user.id
    })
  }

  return NextResponse.json({ error: 'Failed to grant Pro access' }, { status: 500 })
}
