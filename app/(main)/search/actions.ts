'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Log a failed game search for admin review
// Uses upsert to increment count if same query searched again
export async function logSearchRequest(query: string): Promise<void> {
  if (!query || query.trim().length < 2) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminClient = createAdminClient()
  const normalizedQuery = query.trim().toLowerCase()

  // Check if this query already exists
  const { data: existing } = await adminClient
    .from('search_requests')
    .select('id, search_count')
    .ilike('query', normalizedQuery)
    .single()

  if (existing) {
    // Increment count and update timestamp
    await adminClient
      .from('search_requests')
      .update({
        search_count: existing.search_count + 1,
        last_searched_at: new Date().toISOString(),
        user_id: user?.id || existing.id, // Keep last user who searched
      })
      .eq('id', existing.id)
  } else {
    // Insert new request
    await adminClient
      .from('search_requests')
      .insert({
        query: query.trim(),
        user_id: user?.id || null,
        search_count: 1,
      })
  }
}
