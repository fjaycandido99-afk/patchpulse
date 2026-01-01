import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <p className="text-sm text-muted-foreground">
          Last updated: January 2025
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Information We Collect</h2>
          <p className="text-muted-foreground">
            PatchPulse collects information you provide directly, including:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li>Email address when you create an account</li>
            <li>Profile information (display name, avatar, bio)</li>
            <li>Gaming preferences and backlog data</li>
            <li>Connected gaming platform accounts (Steam, Xbox, Riot)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
          <p className="text-muted-foreground">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li>Provide and improve our services</li>
            <li>Send notifications about game updates and patches</li>
            <li>Personalize your experience</li>
            <li>Communicate with you about your account</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. Data Storage and Security</h2>
          <p className="text-muted-foreground">
            Your data is stored securely using industry-standard encryption. We use Supabase
            for data storage with row-level security policies to protect your information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Third-Party Services</h2>
          <p className="text-muted-foreground">
            We integrate with the following third-party services:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li>Steam - for game library sync and patch information</li>
            <li>Xbox/Microsoft - for game library sync</li>
            <li>Riot Games - for game library sync</li>
            <li>RevenueCat - for subscription management</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Your Rights</h2>
          <p className="text-muted-foreground">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li>Access your personal data</li>
            <li>Request deletion of your account and data</li>
            <li>Disconnect linked gaming accounts at any time</li>
            <li>Opt out of push notifications</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:support@patchpulse.app" className="text-primary hover:underline">
              support@patchpulse.app
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
