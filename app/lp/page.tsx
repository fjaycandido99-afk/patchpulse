import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { UTMCapture } from './utm-capture'

export const metadata: Metadata = {
  title: 'PatchPulse - Never Miss a Game Update Again',
  description: 'Track patch notes, gaming news, and updates for all your favorite games in one place. AI-powered summaries, impact scores, and Steam/Xbox sync.',
  openGraph: {
    title: 'PatchPulse - Never Miss a Game Update Again',
    description: 'Track patch notes, gaming news, and updates for all your favorite games in one place.',
    type: 'website',
  },
}

// Feature data
const features = [
  {
    icon: '🎯',
    title: 'Impact Scores',
    description: 'Know instantly if a patch matters. We rate every update so you focus on what counts.',
  },
  {
    icon: '🤖',
    title: 'AI Summaries',
    description: '10,000 words → 3 bullet points. Get the TL;DR of every patch note.',
  },
  {
    icon: '🔗',
    title: 'Library Sync',
    description: 'Connect Steam & Xbox. We automatically track all your games.',
  },
  {
    icon: '📰',
    title: 'Gaming News',
    description: 'All gaming news in one feed. No more checking 10 different sites.',
  },
  {
    icon: '🔔',
    title: 'Smart Alerts',
    description: 'Get notified when your games update. Never be caught off guard.',
  },
  {
    icon: '📋',
    title: 'Game Backlog',
    description: 'Track what you want to play. Organize your gaming life.',
  },
]

// Game logos for social proof
const popularGames = [
  'Valorant',
  'League of Legends',
  'Fortnite',
  'Apex Legends',
  'Destiny 2',
  'Call of Duty',
  'Overwatch 2',
  'CS2',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Capture UTM params for ad tracking */}
      <UTMCapture />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />

        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-16 sm:pt-20 sm:pb-24">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="PatchPulse"
                width={48}
                height={48}
                className="rounded-xl"
              />
              <span className="text-2xl font-bold">PatchPulse</span>
            </div>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center leading-tight">
            Never Miss a
            <span className="text-primary block sm:inline"> Game Update </span>
            Again
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground text-center max-w-2xl mx-auto">
            Your favorite game just got patched. Do you know what changed?
            PatchPulse tracks every update so you&apos;re never caught off guard.
          </p>

          {/* App Store - Primary CTA */}
          <div className="mt-10 flex justify-center">
            <a
              href="https://apps.apple.com/app/id6757092034"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-all hover:scale-105"
            >
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                className="h-14 sm:h-16"
              />
            </a>
          </div>

          {/* Secondary CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl border-2 border-border bg-card px-6 py-3 text-base font-semibold transition-all hover:bg-accent hover:border-accent"
            >
              Use Web App
            </Link>
            <Link
              href="/login?guest=true"
              className="inline-flex items-center justify-center rounded-xl border-2 border-border bg-card px-6 py-3 text-base font-semibold transition-all hover:bg-accent hover:border-accent"
            >
              Try Without Account
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              100% Free
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No Credit Card
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Works on Web & Mobile
            </span>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Sound Familiar?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="text-3xl mb-3">😤</div>
              <p className="text-muted-foreground">
                &ldquo;My main got nerfed and I didn&apos;t even know&rdquo;
              </p>
            </div>
            <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="text-3xl mb-3">😵</div>
              <p className="text-muted-foreground">
                &ldquo;The patch notes are 50 pages long&rdquo;
              </p>
            </div>
            <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="text-3xl mb-3">🤷</div>
              <p className="text-muted-foreground">
                &ldquo;Wait, when did they change this?&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            One app to track all your games. No more missing updates.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Get Started in 30 Seconds
          </h2>

          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Download the App</h3>
              <p className="text-sm text-muted-foreground">
                Free on the App Store
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Sync Your Library</h3>
              <p className="text-sm text-muted-foreground">
                Connect Steam or Xbox, or add games manually
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Stay Updated</h3>
              <p className="text-sm text-muted-foreground">
                Get notified when your games update
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Games We Track */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            We Track Your Favorite Games
          </h2>
          <p className="text-muted-foreground mb-8">
            From competitive shooters to massive MMOs
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {popularGames.map((game) => (
              <span
                key={game}
                className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium"
              >
                {game}
              </span>
            ))}
            <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              + 1000s more
            </span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Never Miss a Patch?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join gamers who stay ahead of the meta
          </p>

          {/* App Store - Primary */}
          <div className="flex justify-center mb-6">
            <a
              href="https://apps.apple.com/app/id6757092034"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-all hover:scale-105"
            >
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                className="h-14"
              />
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            Also available on <Link href="/signup" className="text-primary hover:underline">web</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="PatchPulse"
                width={24}
                height={24}
                className="rounded"
              />
              <span className="font-semibold">PatchPulse</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/login" className="hover:text-foreground transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
