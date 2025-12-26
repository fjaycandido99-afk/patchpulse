// AI Prompts for PatchPulse content processing

export const PATCH_SUMMARY_SYSTEM = `You are an editorial assistant for a gaming app. Your job is to convert messy patch notes into a clean, neutral, factual briefing for gamers.
Rules:
- Do not add information not present in the source text.
- Be concise, clear, and avoid hype/clickbait.
- If something is unclear in the source, say "unclear".
- Output must follow the JSON schema exactly.`

export function getPatchSummaryPrompt(gameName: string, patchTitle: string, rawText: string): string {
  return `TASK: Summarize these patch notes for a gaming app.

GAME: ${gameName}
PATCH TITLE: ${patchTitle}
SOURCE TEXT:
${rawText}

Return JSON with this schema:
{
  "summary_tldr": "string (max 280 chars)",
  "ai_insight": "string (max 120 chars) - a punchy insight about why this patch matters",
  "key_changes": [{"category": "string", "change": "string"}],
  "tags": ["balance|bugfix|content|performance|ui|audio|matchmaking|security|economy|quality-of-life|other"],
  "impact_score": "integer 1-10 (how much gameplay changes; 10 = meta-shifting)",
  "who_it_affects": ["casual", "competitive", "new_players", "endgame", "ranked", "all"],
  "confidence": "float 0-1"
}

Guidance:
- summary_tldr: plain-English, 1–2 sentences, max 280 characters.
- ai_insight: One punchy sentence (max 120 chars) explaining the most important takeaway. Examples: "Major nerfs to top-tier weapons shake up the meta", "Performance fixes should reduce stuttering on older GPUs", "New content adds 10+ hours of gameplay".
- key_changes: array of {category, change} objects. Max 8 items. Each change max 80 chars.
- tags: choose 1–4 from the allowed list.
- impact_score: use evidence in text; if mostly bugfixes, keep <=4.
- confidence: lower if patch notes are vague or incomplete.

Output ONLY valid JSON, no markdown or explanation.`
}

export const NEWS_SUMMARY_SYSTEM = `You are a neutral gaming news editor. Summarize clearly, avoid speculation, and label rumors carefully.
Rules:
- No hype, no opinions, no clickbait tone.
- If the text indicates rumor/leak, mark is_rumor true.
- If source credibility is unclear, reduce confidence.
- Output must follow the JSON schema exactly.`

export function getNewsSummaryPrompt(
  gameName: string | null,
  headline: string,
  rawText: string,
  sourceName: string | null
): string {
  return `TASK: Turn this gaming news into a clean briefing.

GAME: ${gameName || 'General Gaming'}
HEADLINE: ${headline}
SOURCE: ${sourceName || 'Unknown'}
ARTICLE TEXT:
${rawText}

Return JSON with this schema:
{
  "summary": "string (2–3 sentences, max 450 chars)",
  "why_it_matters": "string (1–2 sentences, max 300 chars)",
  "topics": ["Season|DLC|Delay|Launch|Patch|Studio|Esports|Beta|Platform|Pricing|Other"],
  "is_rumor": "boolean",
  "confidence": "float 0-1"
}

Guidance:
- summary: state only confirmed facts from text.
- why_it_matters: explain impact to players (timing, content, balance, cost, availability).
- topics: choose 1–3 from the allowed list.
- is_rumor: true if based on leaks/insiders/anonymous claims.
- confidence: lower if source is unverified or information is vague.

Output ONLY valid JSON, no markdown or explanation.`
}

// Type definitions for AI responses
export type PatchSummaryResult = {
  summary_tldr: string
  ai_insight: string
  key_changes: Array<{ category: string; change: string }>
  tags: string[]
  impact_score: number
  who_it_affects: string[]
  confidence: number
}

export type NewsSummaryResult = {
  summary: string
  why_it_matters: string
  topics: string[]
  is_rumor: boolean
  confidence: number
}

// What's New - Personalized summary of changes since last played
export const WHATS_NEW_SYSTEM = `You are a helpful gaming assistant that summarizes what changed in a game since the player last played.
Rules:
- Be friendly but concise.
- Prioritize changes that affect gameplay (balance, new content, bug fixes).
- Mention the most impactful changes first.
- Use bullet points for clarity.
- Keep the tone casual and helpful, like a friend catching them up.`

export function getWhatsNewPrompt(
  gameName: string,
  daysSinceLastPlayed: number,
  patches: Array<{ title: string; summary: string; impact_score: number; published_at: string }>,
  news: Array<{ title: string; summary: string; published_at: string }>
): string {
  const patchList = patches.length > 0
    ? patches.map(p => `- ${p.title} (Impact: ${p.impact_score}/10): ${p.summary}`).join('\n')
    : 'No patches'

  const newsList = news.length > 0
    ? news.map(n => `- ${n.title}: ${n.summary}`).join('\n')
    : 'No news'

  return `TASK: Create a personalized "What's New" summary for a player returning to a game.

GAME: ${gameName}
DAYS SINCE LAST PLAYED: ${daysSinceLastPlayed}
PATCHES SINCE THEN:
${patchList}

NEWS SINCE THEN:
${newsList}

Create a friendly, concise summary (max 500 chars) that:
1. Highlights the most important changes
2. Mentions any major balance updates or new content
3. Notes any critical bug fixes
4. Briefly mentions relevant news if impactful

If there are no changes, say something like "No major updates since you last played!"

Output ONLY the summary text, no JSON or formatting. Use line breaks for readability.`
}

export type WhatsNewResult = {
  summary: string
  patchCount: number
  newsCount: number
}

// Return to Game Matcher - Check if a patch addresses why the user paused
export const RETURN_MATCH_SYSTEM = `You are a helpful gaming assistant that determines if a game patch addresses the reason a player stopped playing.
Rules:
- Be precise about matching the pause reason to actual patch content.
- Only claim a match if the patch specifically addresses the issue.
- Consider partial matches (patch improves but doesn't fully resolve the issue).
- Output must follow the JSON schema exactly.`

export function getReturnMatchPrompt(
  gameName: string,
  pauseReason: string,
  patchTitle: string,
  patchSummary: string,
  keyChanges: Array<{ category: string; change: string }> | null
): string {
  const changesText = keyChanges && keyChanges.length > 0
    ? keyChanges.map(c => `- [${c.category}] ${c.change}`).join('\n')
    : 'No detailed changes available'

  return `TASK: Determine if this patch might bring the player back to the game.

GAME: ${gameName}
PLAYER'S REASON FOR PAUSING: "${pauseReason}"

PATCH: ${patchTitle}
SUMMARY: ${patchSummary}
KEY CHANGES:
${changesText}

Return JSON with this schema:
{
  "is_match": "boolean (true if patch addresses the pause reason)",
  "confidence": "float 0-1 (how confident the patch addresses the issue)",
  "match_type": "'direct' | 'partial' | 'related' | 'none'",
  "reason": "string (max 150 chars - explain why/how the patch helps, or why it doesn't match)",
  "call_to_action": "string (max 80 chars - encouraging message if it's a match, null if not)"
}

Match Types:
- "direct": Patch specifically fixes the exact issue mentioned
- "partial": Patch improves the situation but may not fully resolve it
- "related": Patch touches on related areas that might help
- "none": No meaningful connection between pause reason and patch

Examples:
- Pause: "Too many bugs/crashes" + Patch fixes stability = direct match
- Pause: "Stuck on difficult part" + Patch adds difficulty options = direct match
- Pause: "Waiting for DLC" + New DLC released = direct match
- Pause: "Lost interest" + Major content update = partial match
- Pause: "Not enough time" + Any patch = none (can't fix real-life constraints)

Output ONLY valid JSON, no markdown or explanation.`
}

export type ReturnMatchResult = {
  is_match: boolean
  confidence: number
  match_type: 'direct' | 'partial' | 'related' | 'none'
  reason: string
  call_to_action: string | null
}

// Patch Source URL Discovery - Find official patch notes page
export const SOURCE_URL_DISCOVERY_SYSTEM = `You are a research assistant that finds official patch notes URLs for games.
Rules:
- Only return official sources (Steam, Epic, publisher websites, official game sites).
- Prioritize the most direct link to the specific patch notes.
- Never return fan sites, forums, or third-party aggregators.
- If you cannot find an official source, return null.`

export function getSourceUrlDiscoveryPrompt(
  gameName: string,
  patchTitle: string,
  publishedDate?: string
): string {
  const dateHint = publishedDate ? ` (published around ${publishedDate})` : ''

  return `TASK: Find the official patch notes URL for this game update.

GAME: ${gameName}
PATCH: ${patchTitle}${dateHint}

Search for the official patch notes page. Look for:
1. Steam Community announcements (store.steampowered.com or steamcommunity.com)
2. Official game website patch notes section
3. Publisher's official news/patch notes page
4. Epic Games Store news (if Epic exclusive)

Return JSON with this schema:
{
  "source_url": "string or null (the official patch notes URL)",
  "source_name": "string or null (e.g., 'Steam', 'Official Website', 'Epic Games')",
  "confidence": "float 0-1 (how confident this is the correct official source)"
}

Important:
- Only return URLs from official sources, never fan sites or forums.
- If multiple sources exist, prefer the publisher's official site over Steam.
- If you cannot find an official source, return {"source_url": null, "source_name": null, "confidence": 0}.

Output ONLY valid JSON, no markdown or explanation.`
}

export type SourceUrlDiscoveryResult = {
  source_url: string | null
  source_name: string | null
  confidence: number
}
