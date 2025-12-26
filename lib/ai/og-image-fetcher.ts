// OG Image Fetcher - Extracts Open Graph images from URLs

type OGImageResult = {
  imageUrl: string | null
  title: string | null
  description: string | null
  siteName: string | null
}

/**
 * Fetches and extracts Open Graph image from a URL
 */
export async function fetchOGImage(url: string): Promise<OGImageResult> {
  const emptyResult: OGImageResult = {
    imageUrl: null,
    title: null,
    description: null,
    siteName: null,
  }

  if (!url) return emptyResult

  try {
    // Fetch the page with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PatchPulseBot/1.0; +https://patchpulse.app)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status}`)
      return emptyResult
    }

    const html = await response.text()

    // Extract OG meta tags using regex (faster than DOM parsing)
    const ogImage = extractMetaContent(html, 'og:image') || extractMetaContent(html, 'twitter:image')
    const ogTitle = extractMetaContent(html, 'og:title')
    const ogDescription = extractMetaContent(html, 'og:description')
    const ogSiteName = extractMetaContent(html, 'og:site_name')

    // Validate and normalize the image URL
    let imageUrl = ogImage
    if (imageUrl) {
      // Handle relative URLs
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl
      } else if (imageUrl.startsWith('/')) {
        const urlObj = new URL(url)
        imageUrl = `${urlObj.origin}${imageUrl}`
      }

      // Basic validation - must be a valid URL
      try {
        new URL(imageUrl)
      } catch {
        imageUrl = null
      }
    }

    return {
      imageUrl: imageUrl || null,
      title: ogTitle || null,
      description: ogDescription || null,
      siteName: ogSiteName || null,
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`Timeout fetching OG image from ${url}`)
    } else {
      console.warn(`Error fetching OG image from ${url}:`, error)
    }
    return emptyResult
  }
}

/**
 * Extract meta tag content from HTML string
 */
function extractMetaContent(html: string, property: string): string | null {
  // Match both property="og:image" and name="og:image" formats
  const patterns = [
    new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i'),
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      // Decode HTML entities
      return decodeHTMLEntities(match[1].trim())
    }
  }

  return null
}

/**
 * Decode common HTML entities
 */
function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

/**
 * Batch fetch OG images for multiple URLs
 */
export async function batchFetchOGImages(
  urls: Array<{ id: string; url: string }>
): Promise<Map<string, OGImageResult>> {
  const results = new Map<string, OGImageResult>()

  // Fetch in parallel with concurrency limit
  const CONCURRENCY = 5
  const chunks: Array<typeof urls> = []

  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    chunks.push(urls.slice(i, i + CONCURRENCY))
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async ({ id, url }) => {
      const result = await fetchOGImage(url)
      results.set(id, result)
    })

    await Promise.all(promises)
  }

  return results
}
