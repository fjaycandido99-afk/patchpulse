// Check upcoming_releases table
// Run with: npx tsx scripts/check-releases.ts

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load env vars from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function check() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('Checking upcoming_releases table...\n')

  // Check if table exists and has data
  const { data, error, count } = await supabase
    .from('upcoming_releases')
    .select('*, games(name)', { count: 'exact' })
    .limit(5)

  if (error) {
    console.log('Error:', error.message)
    return
  }

  console.log('Total releases:', count)
  console.log('Sample data:', JSON.stringify(data, null, 2))
}

check().catch(console.error)
