import { ReactNode } from 'react'

type MetaRowProps = {
  items: (string | ReactNode | null | undefined)[]
  separator?: string
  size?: 'sm' | 'xs'
  className?: string
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
      {filteredItems.map((item, index) => (
        <span key={index} className="inline-flex items-center gap-2">
          {index > 0 && (
            <span className="text-zinc-600" aria-hidden="true">
              {separator}
            </span>
          )}
          <span>{item}</span>
        </span>
      ))}
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
