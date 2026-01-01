import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Terms of Service</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <p className="text-sm text-muted-foreground">
          Last updated: January 2025
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using PatchPulse, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Description of Service</h2>
          <p className="text-muted-foreground">
            PatchPulse is a gaming companion app that helps you track game updates, patches,
            and manage your gaming backlog. We aggregate information from various gaming
            platforms and news sources to keep you informed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. User Accounts</h2>
          <p className="text-muted-foreground">
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activities that occur under your account. You must be at least 13 years
            old to use this service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Subscriptions and Payments</h2>
          <p className="text-muted-foreground">
            PatchPulse offers both free and premium subscription tiers. Premium subscriptions
            are billed through the App Store or Google Play. Subscription terms, pricing, and
            cancellation policies are governed by the respective app store policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Acceptable Use</h2>
          <p className="text-muted-foreground">
            You agree not to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with the proper functioning of the service</li>
            <li>Scrape or collect data from our service without permission</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Intellectual Property</h2>
          <p className="text-muted-foreground">
            Game names, logos, and related content are trademarks of their respective owners.
            PatchPulse does not claim ownership of any third-party content displayed in the app.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">7. Disclaimer of Warranties</h2>
          <p className="text-muted-foreground">
            The service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
            the accuracy, completeness, or timeliness of game update information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">8. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            PatchPulse shall not be liable for any indirect, incidental, special, consequential,
            or punitive damages resulting from your use of the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">9. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these terms at any time. We will notify users of
            significant changes via the app or email.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">10. Contact</h2>
          <p className="text-muted-foreground">
            For questions about these Terms of Service, contact us at{' '}
            <a href="mailto:support@patchpulse.app" className="text-primary hover:underline">
              support@patchpulse.app
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
