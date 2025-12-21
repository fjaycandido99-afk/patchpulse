import Link from 'next/link'
import Image from 'next/image'

type BacklogCardProps = {
  href: string
  title: string
  progress: number
  nextNote?: string | null
  lastPlayedText?: string | null
  imageUrl?: string | null
}

function getInitials(text: string): string {
  return text
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted">
      <div
        className="h-1.5 rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function BacklogCard({
  href,
  title,
  progress,
  nextNote,
  lastPlayedText,
  imageUrl,
}: BacklogCardProps) {
  return (
    <Link
      href={href}
      className="group flex gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50"
    >
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 via-muted to-background">
            <span className="text-sm font-bold text-primary/30 select-none">
              {getInitials(title)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center overflow-hidden">
        <h3 className="font-medium leading-tight truncate group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ProgressBar value={progress} />
            </div>
            <span className="text-xs font-medium text-muted-foreground w-8 text-right">
              {progress}%
            </span>
          </div>
        </div>

        {(nextNote || lastPlayedText) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            {nextNote && (
              <span className="truncate flex-1">
                <span className="text-muted-foreground/60">Next:</span> {nextNote}
              </span>
            )}
            {lastPlayedText && !nextNote && (
              <span className="text-muted-foreground/70">{lastPlayedText}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export function BacklogCardCompact({
  href,
  title,
  progress,
  lastPlayedText,
}: Omit<BacklogCardProps, 'imageUrl' | 'nextNote'>) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/50"
    >
      <div className="flex-1 overflow-hidden">
        <h3 className="font-medium leading-tight truncate group-hover:text-primary transition-colors">
          {title}
        </h3>
        {lastPlayedText && (
          <p className="mt-0.5 text-xs text-muted-foreground/70 truncate">
            {lastPlayedText}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-16 hidden sm:block">
          <ProgressBar value={progress} />
        </div>
        <span className="text-xs font-medium text-muted-foreground w-8 text-right">
          {progress}%
        </span>
      </div>
    </Link>
  )
}
