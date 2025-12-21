type TagChipProps = {
  label: string
  onClick?: () => void
  active?: boolean
  className?: string
}

export function TagChip({
  label,
  onClick,
  active = false,
  className = '',
}: TagChipProps) {
  const isClickable = !!onClick

  const baseStyles =
    'inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium border border-white/10 transition-colors'

  const stateStyles = active
    ? 'bg-white/15 text-zinc-100'
    : 'bg-white/5 text-zinc-300'

  const interactiveStyles = isClickable
    ? 'cursor-pointer hover:bg-white/10 hover:text-zinc-100'
    : ''

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseStyles} ${stateStyles} ${interactiveStyles} ${className}`}
      >
        {label}
      </button>
    )
  }

  return (
    <span className={`${baseStyles} ${stateStyles} ${className}`}>{label}</span>
  )
}

type TagChipListProps = {
  tags: string[]
  max?: number
  onTagClick?: (tag: string) => void
  activeTag?: string
  className?: string
}

export function TagChipList({
  tags,
  max,
  onTagClick,
  activeTag,
  className = '',
}: TagChipListProps) {
  const displayTags = max ? tags.slice(0, max) : tags
  const remaining = max && tags.length > max ? tags.length - max : 0

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {displayTags.map((tag) => (
        <TagChip
          key={tag}
          label={tag}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
          active={activeTag === tag}
        />
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-1.5 text-[11px] text-zinc-500">
          +{remaining}
        </span>
      )}
    </div>
  )
}
