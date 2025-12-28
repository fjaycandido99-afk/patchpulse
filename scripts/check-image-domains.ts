import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function check() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('news_items')
    .select('image_url, title')
    .not('image_url', 'is', null)
    .limit(30)

  const domains = new Set<string>()
  console.log('\nSample image URLs:')
  data?.slice(0, 5).forEach(item => {
    console.log(`  ${item.image_url?.substring(0, 80)}...`)
  })

  data?.forEach(item => {
    try {
      const url = new URL(item.image_url)
      domains.add(url.hostname)
    } catch {}
  })

  console.log('\nUnique domains found:')
  domains.forEach(d => console.log(`  ${d}`))
}

check()
