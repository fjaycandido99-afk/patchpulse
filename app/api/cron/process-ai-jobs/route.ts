import { NextResponse } from 'next/server'
import { processAIJobsBatch } from '@/app/(admin)/admin/ai/worker'

export const runtime = 'nodejs'

function verifyAuth(req: Request): boolean {
  // Vercel cron
  if (req.headers.get('x-vercel-cron') === '1') return true
  // Manual call with secret
  const secret = req.headers.get('x-cron-secret')
  return !!process.env.CRON_SECRET && secret === process.env.CRON_SECRET
}

export async function GET(req: Request) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const result = await processAIJobsBatch(8)
  return NextResponse.json({ ok: true, ...result })
}

export async function POST(req: Request) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const result = await processAIJobsBatch(8)
  return NextResponse.json({ ok: true, ...result })
}
