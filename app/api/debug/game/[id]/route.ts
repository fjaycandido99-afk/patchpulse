import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    // Try to fetch the game
    const { data, error } = await supabase
      .from('games')
      .select('id, name')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details
      })
    }

    return NextResponse.json({
      success: true,
      game: data
    })
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      exception: e.message
    })
  }
}
