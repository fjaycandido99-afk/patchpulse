import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Delete all credentials for this user
    const { error: deleteError } = await supabase
      .from('webauthn_credentials')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Failed to delete credentials:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove credentials' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('WebAuthn remove error:', error)
    return NextResponse.json(
      { error: 'Failed to remove credentials' },
      { status: 500 }
    )
  }
}
