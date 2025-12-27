import Anthropic from '@anthropic-ai/sdk'

let _anthropic: Anthropic | null = null
function getClient() {
  if (!_anthropic) _anthropic = new Anthropic()
  return _anthropic
}

type NotificationType = 'new_patch' | 'new_news' | 'game_release' | 'ai_digest'

type NotificationContext = {
  type: NotificationType
  gameName: string
  title?: string
  content?: string
  impactScore?: number
  topics?: string[]
  isRumor?: boolean
  version?: string
}

type GeneratedNotification = {
  title: string
  body: string
  priority: number
}

/**
 * Generate AI-powered notification content
 * Creates engaging, personalized notification titles and bodies
 */
export async function generateNotificationContent(
  context: NotificationContext
): Promise<GeneratedNotification> {
  const systemPrompt = `You are a gaming news notification writer. Your job is to create short, punchy notification text that gets gamers excited to tap and learn more.

Rules:
- Title: Max 50 characters, action-oriented, no "New" prefix
- Body: Max 100 characters, tease the most interesting detail
- Use gaming terminology when appropriate
- Be direct, not clickbaity
- Match the tone to the content (exciting for big updates, informative for patches)
- For rumors, add subtle uncertainty
- Prioritize what matters to players (gameplay changes > bug fixes)`

  const prompt = buildPrompt(context)

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return parseNotificationResponse(text, context)
  } catch (error) {
    console.error('AI notification generation failed:', error)
    // Fallback to basic content
    return generateFallbackContent(context)
  }
}

function buildPrompt(context: NotificationContext): string {
  switch (context.type) {
    case 'new_patch':
      return `Generate a notification for a patch update:
Game: ${context.gameName}
Patch: ${context.title || 'New Update'}
Version: ${context.version || 'Latest'}
Impact Score: ${context.impactScore || 5}/10
Summary: ${context.content || 'Various improvements and fixes'}

Format your response as:
TITLE: [your title]
BODY: [your body]
PRIORITY: [1-5]`

    case 'new_news':
      return `Generate a notification for gaming news:
Game: ${context.gameName}
Headline: ${context.title || 'News Update'}
Topics: ${context.topics?.join(', ') || 'General'}
Is Rumor: ${context.isRumor ? 'Yes' : 'No'}
Summary: ${context.content || 'Important update'}

Format your response as:
TITLE: [your title]
BODY: [your body]
PRIORITY: [1-5]`

    case 'game_release':
      return `Generate a notification for an upcoming game release:
Game: ${context.gameName}
Details: ${context.content || 'Coming soon'}

Format your response as:
TITLE: [your title]
BODY: [your body]
PRIORITY: [1-5]`

    case 'ai_digest':
      return `Generate a notification for a weekly AI digest:
Game: ${context.gameName}
Summary: ${context.content || 'Weekly roundup of patches and news'}

Format your response as:
TITLE: [your title]
BODY: [your body]
PRIORITY: [1-5]`

    default:
      return `Generate a notification:
Game: ${context.gameName}
Content: ${context.content || 'Update available'}

Format your response as:
TITLE: [your title]
BODY: [your body]
PRIORITY: [1-5]`
  }
}

function parseNotificationResponse(text: string, context: NotificationContext): GeneratedNotification {
  const titleMatch = text.match(/TITLE:\s*(.+?)(?:\n|$)/i)
  const bodyMatch = text.match(/BODY:\s*(.+?)(?:\n|$)/i)
  const priorityMatch = text.match(/PRIORITY:\s*(\d)/i)

  const title = titleMatch?.[1]?.trim() || generateFallbackContent(context).title
  const body = bodyMatch?.[1]?.trim() || generateFallbackContent(context).body
  const priority = priorityMatch ? parseInt(priorityMatch[1], 10) : calculatePriority(context)

  return {
    title: title.slice(0, 50),
    body: body.slice(0, 100),
    priority: Math.min(5, Math.max(1, priority)),
  }
}

function generateFallbackContent(context: NotificationContext): GeneratedNotification {
  const priority = calculatePriority(context)

  switch (context.type) {
    case 'new_patch':
      return {
        title: `${context.gameName} Patch ${context.version || 'Update'}`,
        body: context.content?.slice(0, 100) || 'New patch notes available',
        priority,
      }

    case 'new_news':
      const prefix = context.isRumor ? 'Rumor: ' : ''
      return {
        title: `${prefix}${context.gameName} News`,
        body: context.content?.slice(0, 100) || context.title?.slice(0, 100) || 'Check out the latest news',
        priority,
      }

    case 'game_release':
      return {
        title: `${context.gameName} - Release Update`,
        body: context.content?.slice(0, 100) || 'Release date announcement',
        priority,
      }

    case 'ai_digest':
      return {
        title: `${context.gameName} Weekly Digest`,
        body: 'Your personalized roundup is ready',
        priority: 3,
      }

    default:
      return {
        title: `${context.gameName} Update`,
        body: context.content?.slice(0, 100) || 'New update available',
        priority: 3,
      }
  }
}

function calculatePriority(context: NotificationContext): number {
  if (context.impactScore) {
    if (context.impactScore >= 8) return 5
    if (context.impactScore >= 6) return 4
    if (context.impactScore >= 4) return 3
    return 2
  }

  if (context.topics) {
    if (context.topics.includes('Launch')) return 5
    if (context.topics.includes('DLC')) return 4
    if (context.topics.includes('Delay')) return 4
  }

  if (context.isRumor) return 2

  return 3
}
