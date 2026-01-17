import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Regex to detect non-Latin characters (CJK, Cyrillic, Arabic, Thai, Hebrew, etc.)
function hasNonLatinCharacters(text: string): boolean {
  // This regex matches characters outside basic Latin, extended Latin, and common punctuation
  const nonLatinRegex = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\u0400-\u04FF\u0600-\u06FF\u0E00-\u0E7F\u0590-\u05FF\u1100-\u11FF\uFF00-\uFFEF]/
  return nonLatinRegex.test(text)
}

async function deleteNonEnglishVideos() {
  console.log('Fetching all videos...')

  // Fetch all videos
  const { data: videos, error } = await supabase
    .from('game_videos')
    .select('id, title, channel_name')

  if (error) {
    console.error('Error fetching videos:', error)
    return
  }

  console.log(`Found ${videos?.length || 0} total videos`)

  // Find videos with non-Latin titles
  const nonEnglishVideos = videos?.filter(v => hasNonLatinCharacters(v.title)) || []

  console.log(`Found ${nonEnglishVideos.length} videos with non-Latin titles:`)
  nonEnglishVideos.forEach(v => {
    console.log(`  - ${v.title.substring(0, 50)}... (${v.channel_name})`)
  })

  if (nonEnglishVideos.length === 0) {
    console.log('No non-English videos to delete!')
    return
  }

  // Delete them
  const idsToDelete = nonEnglishVideos.map(v => v.id)

  console.log(`\nDeleting ${idsToDelete.length} videos...`)

  const { error: deleteError } = await supabase
    .from('game_videos')
    .delete()
    .in('id', idsToDelete)

  if (deleteError) {
    console.error('Error deleting videos:', deleteError)
  } else {
    console.log(`✓ Deleted ${idsToDelete.length} non-English videos`)
  }
}

deleteNonEnglishVideos()
