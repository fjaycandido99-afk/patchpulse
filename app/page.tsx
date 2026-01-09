import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="flex max-w-2xl flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Your Gaming Command Center
        </h1>

        <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
          Stay on top of the latest patch notes, track gaming news, and manage your backlog—all in one place.
          Never miss an update for your favorite games.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-input bg-background px-8 py-3 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Log In
          </Link>
        </div>

        {/* App Store Download */}
        <div className="mt-8">
          <a
            href="https://apps.apple.com/app/patchpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition-opacity hover:opacity-80"
          >
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="Download on the App Store"
              className="h-12"
            />
          </a>
        </div>
      </div>
    </div>
  )
}
