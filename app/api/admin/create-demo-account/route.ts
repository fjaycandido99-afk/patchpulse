import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/admin/create-demo-account
// Creates a demo account for Apple App Store review
export async function POST(request: Request) {
  // Verify this is an authorized request
  const authHeader = request.headers.get('authorization')
  const expectedSecret = process.env.CRON_SECRET

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const demoEmail = 'apple-review@patchpulse.app'
  const demoPassword = 'AppleReview2026!'

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === demoEmail)

    if (existingUser) {
      // Update password if user exists
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: demoPassword, email_confirm: true }
      )

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Demo account updated',
        credentials: {
          email: demoEmail,
          password: demoPassword,
        }
      })
    }

    // Create new user with auto-confirm
    const { data, error } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        is_demo_account: true,
        created_for: 'Apple App Store Review',
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Demo account created',
      userId: data.user?.id,
      credentials: {
        email: demoEmail,
        password: demoPassword,
      }
    })
  } catch (error) {
    console.error('Error creating demo account:', error)
    return NextResponse.json({ error: 'Failed to create demo account' }, { status: 500 })
  }
}
