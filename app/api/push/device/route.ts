import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/push/device - Save device token for native push
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { token, platform } = await request.json()

    if (!token || !platform) {
      return NextResponse.json({ error: 'Token and platform required' }, { status: 400 })
    }

    // Upsert device token
    const { error } = await supabase
      .from('device_tokens')
      .upsert({
        user_id: user.id,
        token,
        platform,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,token',
      })

    if (error) {
      console.error('Error saving device token:', error)
      return NextResponse.json({ error: 'Failed to save token' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing device token:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// DELETE /api/push/device - Remove device token
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Delete all tokens for this user (or could delete specific token if provided)
    const { error } = await supabase
      .from('device_tokens')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting device token:', error)
      return NextResponse.json({ error: 'Failed to delete token' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing delete request:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
