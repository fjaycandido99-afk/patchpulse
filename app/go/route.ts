import { redirect } from 'next/navigation'

// Generic short URL: patchpulse.app/go
export async function GET() {
  redirect('/lp')
}
