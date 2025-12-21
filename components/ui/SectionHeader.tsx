import Link from 'next/link'

type SectionHeaderProps = {
  title: string
  href?: string
  actionLabel?: string
}

export function SectionHeader({
  title,
  href,
  actionLabel = 'View all →',
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-lg font-semibold tracking-tight text-white">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-sm text-zinc-400 transition-colors hover:text-white"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
