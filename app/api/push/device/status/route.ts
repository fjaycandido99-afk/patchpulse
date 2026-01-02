import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/push/device/status - Check if user has push enabled
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ enabled: false })
  }

  try {
    const { data, error } = await supabase
      .from('device_tokens')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (error) {
      console.error('Error checking device token:', error)
      return NextResponse.json({ enabled: false })
    }

    return NextResponse.json({ enabled: data && data.length > 0 })
  } catch (error) {
    console.error('Error checking push status:', error)
    return NextResponse.json({ enabled: false })
  }
}
