import Link from 'next/link'
import { Calendar, Gamepad2, Search, Bell } from 'lucide-react'

type EmptyGameStateProps = {
  type: 'releases' | 'upcoming'
  title?: string
  description?: string
}

const defaultContent = {
  releases: {
    icon: Gamepad2,
    title: "We're tracking new releases",
    description:
      'Major new releases will appear here. PatchPulse adds games as they launch and begin receiving patches.',
    primaryAction: { label: 'Browse all games', href: '/search' },
    secondaryAction: { label: 'View patches', href: '/home' },
  },
  upcoming: {
    icon: Calendar,
    title: "We're tracking upcoming releases",
    description:
      'PatchPulse adds new releases 14–30 days before launch, once meaningful updates and coverage are available.',
    primaryAction: { label: 'Follow games', href: '/search' },
    secondaryAction: { label: 'Get notified', href: '/profile' },
  },
}

export function EmptyGameState({
  type,
  title,
  description,
}: EmptyGameStateProps) {
  const content = defaultContent[type]
  const Icon = content.icon

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center sm:px-12 sm:py-16">
      <div className="mb-4 rounded-full bg-primary/10 p-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>

      <h3 className="text-lg font-semibold text-foreground sm:text-xl">
        {title || content.title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
        {description || content.description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={content.primaryAction.href}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Search className="h-4 w-4" />
          {content.primaryAction.label}
        </Link>
        <Link
          href={content.secondaryAction.href}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Bell className="h-4 w-4" />
          {content.secondaryAction.label}
        </Link>
      </div>
    </div>
  )
}

// Smaller inline empty state for sections
export function EmptyGameStateInline({
  message,
}: {
  message: string
}) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-card/30 px-4 py-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
