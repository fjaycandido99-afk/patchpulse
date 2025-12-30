import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fix() {
  // Use Steam's library capsule - the correct portrait format
  const steamCover = 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/library_600x900.jpg'

  const { data, error } = await supabase
    .from('games')
    .update({ cover_url: steamCover })
    .eq('id', '91ec957d-b96a-4b27-90d2-3467772e96bd')
    .select('name, cover_url')

  if (error) {
    console.log('Error:', error.message)
  } else {
    console.log('Updated Dota 2:', data)
  }
}

fix().catch(console.error)
