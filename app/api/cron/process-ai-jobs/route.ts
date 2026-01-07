import { NextResponse } from 'next/server'
import { processAIJobsBatch } from '@/app/(admin)/admin/ai/worker'
import { verifyCronAuth } from '@/lib/cron-auth'

export const runtime = 'nodejs'
export const maxDuration = 60 // 1 minute max for AI jobs batch

export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const result = await processAIJobsBatch(8)
  return NextResponse.json({ ok: true, ...result })
}

export async function POST(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const result = await processAIJobsBatch(8)
  return NextResponse.json({ ok: true, ...result })
}
