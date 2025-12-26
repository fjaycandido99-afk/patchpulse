/**
 * Convert MVP Games CSV to SQL INSERT statements
 * Run with: npx tsx scripts/csv-to-sql.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const CSV_PATH = path.join(__dirname, 'output', 'mvp-games.csv')
const SQL_PATH = path.join(__dirname, 'output', 'mvp-games-insert.sql')

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''")
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())

  return result
}

function main() {
  console.log('📄 Reading CSV...')
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
  const lines = csvContent.split('\n').filter(line => line.trim())

  // Skip header
  const dataLines = lines.slice(1)

  console.log(`📊 Found ${dataLines.length} games`)

  const sqlLines: string[] = [
    '-- ============================================================================',
    '-- MVP GAMES INSERT',
    '-- Generated: ' + new Date().toISOString(),
    `-- Total games: ${dataLines.length}`,
    '-- ============================================================================',
    '',
    '-- Run supabase-mvp-games.sql first to add the required columns!',
    '',
    '-- Upsert games (insert or update on conflict)',
    '',
  ]

  for (const line of dataLines) {
    if (!line.trim()) continue

    const fields = parseCSVLine(line)
    if (fields.length < 9) continue

    const [name, slug, platforms, genre, isLiveService, mvpEligible, supportTier, curatedException, coverUrl] = fields

    // Convert platforms string to PostgreSQL array
    const platformsArray = platforms
      .split(',')
      .map(p => `'${escapeSQL(p.trim())}'`)
      .join(', ')

    const escapedName = escapeSQL(name)
    const escapedGenre = genre ? `'${escapeSQL(genre)}'` : 'NULL'
    const escapedCoverUrl = coverUrl ? `'${escapeSQL(coverUrl)}'` : 'NULL'

    sqlLines.push(`INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)`)
    sqlLines.push(`VALUES ('${escapedName}', '${slug}', ${escapedCoverUrl}, ARRAY[${platformsArray}]::text[], ${escapedGenre}, ${isLiveService}, ${mvpEligible}, '${supportTier}', ${curatedException}, now())`)
    sqlLines.push(`ON CONFLICT (slug) DO UPDATE SET`)
    sqlLines.push(`  name = EXCLUDED.name,`)
    sqlLines.push(`  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),`)
    sqlLines.push(`  platforms = EXCLUDED.platforms,`)
    sqlLines.push(`  genre = COALESCE(games.genre, EXCLUDED.genre),`)
    sqlLines.push(`  is_live_service = EXCLUDED.is_live_service,`)
    sqlLines.push(`  mvp_eligible = EXCLUDED.mvp_eligible,`)
    sqlLines.push(`  support_tier = EXCLUDED.support_tier,`)
    sqlLines.push(`  curated_exception = EXCLUDED.curated_exception,`)
    sqlLines.push(`  eligibility_checked_at = now();`)
    sqlLines.push('')
  }

  // Add verification
  sqlLines.push('-- ============================================================================')
  sqlLines.push('-- VERIFICATION')
  sqlLines.push('-- ============================================================================')
  sqlLines.push('')
  sqlLines.push('SELECT')
  sqlLines.push("  COUNT(*) FILTER (WHERE mvp_eligible = true) as mvp_games,")
  sqlLines.push("  COUNT(*) FILTER (WHERE is_live_service = true) as live_service_games,")
  sqlLines.push("  COUNT(*) FILTER (WHERE curated_exception = true) as curated_exceptions,")
  sqlLines.push('  COUNT(DISTINCT genre) as unique_genres')
  sqlLines.push('FROM public.games;')

  console.log('💾 Writing SQL file...')
  fs.writeFileSync(SQL_PATH, sqlLines.join('\n'))

  console.log(`✅ Done! SQL file created at: ${SQL_PATH}`)
  console.log('')
  console.log('Next steps:')
  console.log('1. Run supabase-mvp-games.sql in Supabase SQL Editor (adds columns)')
  console.log('2. Run scripts/output/mvp-games-insert.sql in Supabase SQL Editor (adds games)')
}

main()
