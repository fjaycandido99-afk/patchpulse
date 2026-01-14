import { redirect } from 'next/navigation'

// Short URL for Facebook ads: patchpulse.app/fb
export async function GET() {
  redirect('/lp?utm_source=facebook&utm_medium=cpc&utm_campaign=fb_ads')
}
