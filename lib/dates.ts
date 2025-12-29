export function formatDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) {
      return 'Invalid date'
    }
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}

export function daysUntil(date: string | Date): number {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) {
      return 0
    }
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    d.setHours(0, 0, 0, 0)
    const diff = d.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  } catch {
    return 0
  }
}

export function relativeDaysText(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) {
      return 'Invalid date'
    }
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(d)
    target.setHours(0, 0, 0, 0)
    const diff = target.getTime() - now.getTime()
    const days = Math.round(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'today'
    if (days === 1) return 'tomorrow'
    if (days === -1) return 'yesterday'
    if (days > 0) return `in ${days} days`
    return `${Math.abs(days)} days ago`
  } catch {
    return 'Invalid date'
  }
}

// Granular time badge for "Released X ago" with hours/minutes precision
export function releasedAgoText(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) {
      return 'Released'
    }
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just released'
    if (diffMins < 60) return `Released ${diffMins}m ago`
    if (diffHours < 24) return `Released ${diffHours}h ago`
    if (diffDays === 1) return 'Released yesterday'
    if (diffDays < 7) return `Released ${diffDays}d ago`
    if (diffDays < 14) return 'Released last week'
    if (diffDays < 30) return `Released ${Math.floor(diffDays / 7)}w ago`
    return `Released ${formatDate(d)}`
  } catch {
    return 'Released'
  }
}

// Countdown text for upcoming releases
export function countdownText(date: string | Date | null): string {
  if (!date) return 'TBA'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) {
      return 'TBA'
    }
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(d)
    target.setHours(0, 0, 0, 0)
    const diffMs = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Out now'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `In ${diffDays} days`
    if (diffDays <= 14) return 'Next week'
    if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`
    if (diffDays <= 60) return 'Next month'
    if (diffDays <= 90) return `In ${Math.ceil(diffDays / 30)} months`
    // Show quarter for distant dates
    const quarter = Math.ceil((d.getMonth() + 1) / 3)
    return `Q${quarter} ${d.getFullYear()}`
  } catch {
    return 'TBA'
  }
}

// Short countdown badge (e.g., "14d", "3w", "Q1 2026")
export function countdownBadge(date: string | Date | null): string {
  if (!date) return 'TBA'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) {
      return 'TBA'
    }
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(d)
    target.setHours(0, 0, 0, 0)
    const diffMs = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'OUT'
    if (diffDays === 0) return 'TODAY'
    if (diffDays <= 7) return `${diffDays}d`
    if (diffDays <= 60) return `${Math.ceil(diffDays / 7)}w`
    if (diffDays <= 365) return `${Math.ceil(diffDays / 30)}mo`
    const quarter = Math.ceil((d.getMonth() + 1) / 3)
    return `Q${quarter}'${String(d.getFullYear()).slice(-2)}`
  } catch {
    return 'TBA'
  }
}

// "Updated X ago" for section freshness
export function updatedAgoText(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) {
      return ''
    }
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Updated just now'
    if (diffMins < 60) return `Updated ${diffMins}m ago`
    if (diffHours < 24) return `Updated ${diffHours}h ago`
    if (diffDays === 1) return 'Updated yesterday'
    return `Updated ${diffDays}d ago`
  } catch {
    return ''
  }
}
