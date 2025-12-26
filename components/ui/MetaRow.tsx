import { ReactNode } from 'react'

type MetaRowProps = {
  items: (string | ReactNode | null | undefined)[]
  separator?: string
  size?: 'sm' | 'xs'
  className?: string
}

// Check if a string looks like a date (contains patterns like "Dec", "2024", etc.)
function looksLikeDate(text: string): boolean {
  const datePatterns = [
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i,
    /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/,
    /\b\d{4}\b/,
    /\b(today|yesterday|ago)\b/i,
  ]
  return datePatterns.some(pattern => pattern.test(text))
}

export function MetaRow({
  items,
  separator = '·',
  size = 'sm',
  className = '',
}: MetaRowProps) {
  const filteredItems = items.filter(
    (item): item is string | ReactNode =>
      item !== null && item !== undefined && item !== ''
  )

  if (filteredItems.length === 0) {
    return null
  }

  const sizeStyles = size === 'sm' ? 'text-sm' : 'text-xs'

  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-zinc-400 ${sizeStyles} ${className}`}
    >
      {filteredItems.map((item, index) => {
        const isDate = typeof item === 'string' && looksLikeDate(item)
        const isFirst = index === 0

        return (
          <span key={index} className="inline-flex items-center gap-2">
            {index > 0 && (
              <span className="text-zinc-600" aria-hidden="true">
                {separator}
              </span>
            )}
            <span className={`${isDate ? 'text-zinc-500' : ''} ${isFirst ? 'font-medium' : ''}`}>
              {item}
            </span>
          </span>
        )
      })}
    </div>
  )
}

type GameMetaRowProps = {
  gameName?: string | null
  type?: string | null
  time?: string | null
  size?: 'sm' | 'xs'
  className?: string
}

export function GameMetaRow({
  gameName,
  type,
  time,
  size = 'sm',
  className = '',
}: GameMetaRowProps) {
  return (
    <MetaRow
      items={[gameName, type, time]}
      size={size}
      className={className}
    />
  )
}

type PatchMetaRowProps = {
  gameName?: string | null
  date?: string | null
  impactLabel?: string | null
  size?: 'sm' | 'xs'
  className?: string
}

export function PatchMetaRow({
  gameName,
  date,
  impactLabel,
  size = 'sm',
  className = '',
}: PatchMetaRowProps) {
  return (
    <MetaRow
      items={[gameName, date, impactLabel]}
      size={size}
      className={className}
    />
  )
}

type NewsMetaRowProps = {
  gameName?: string | null
  sourceName?: string | null
  date?: string | null
  size?: 'sm' | 'xs'
  className?: string
}

export function NewsMetaRow({
  gameName,
  sourceName,
  date,
  size = 'sm',
  className = '',
}: NewsMetaRowProps) {
  return (
    <MetaRow
      items={[gameName || 'General', sourceName, date]}
      size={size}
      className={className}
    />
  )
}
