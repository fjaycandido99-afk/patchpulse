import { NextResponse } from 'next/server'
import { processAIJobsBatch } from '@/app/(admin)/admin/ai/worker'

export const runtime = 'nodejs'

function verifyAuth(req: Request): boolean {
  // Vercel cron sends CRON_SECRET as Bearer token
  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    if (process.env.CRON_SECRET && token === process.env.CRON_SECRET) {
      return true
    }
  }

  // Manual call with x-cron-secret header
  const cronSecret = req.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET) {
    return true
  }

  // Fallback: check for Vercel internal cron header
  if (req.headers.get('x-vercel-cron') === '1') {
    return true
  }

  return false
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
