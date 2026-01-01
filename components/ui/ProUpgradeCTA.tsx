import Link from 'next/link'
import { Crown, Lock } from 'lucide-react'

type ProUpgradeCTAProps = {
  title: string
  description: string
  features?: string[]
}

export function ProUpgradeCTA({ title, description, features }: ProUpgradeCTAProps) {
  return (
    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
      <div className="flex flex-col items-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{description}</p>

        {features && features.length > 0 && (
          <ul className="text-sm text-left space-y-2 mb-6 w-full">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Crown className="w-4 h-4" />
          Upgrade to Pro
        </Link>
      </div>
    </div>
  )
}
