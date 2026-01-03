import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | PatchPulse',
  description: 'Terms and conditions for using PatchPulse.',
}

export default function TermsOfServicePage() {
  const lastUpdated = 'January 3, 2025'
  const contactEmail = 'support@patchpulse.app'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-8">
        {/* 1. Acceptance */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using PatchPulse (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. These terms apply to all users, including visitors, registered users, and subscribers.
          </p>
        </section>

        {/* 2. Description */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Description of Service</h2>
          <p className="text-muted-foreground">
            PatchPulse is a gaming companion application that helps you track game updates, patches, news, deals, and manage your gaming backlog. We aggregate publicly available information from various gaming platforms, news sources, and APIs. PatchPulse is not affiliated with, endorsed by, or sponsored by any game publishers or platforms unless explicitly stated.
          </p>
        </section>

        {/* 3. User Accounts */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. User Accounts</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
            <li>You must be at least 13 years old to use this service.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You are responsible for all activities that occur under your account.</li>
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You may not share your account or allow others to access it.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
          </ul>
        </section>

        {/* 4. Subscriptions */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Subscriptions and Payments</h2>
          <p className="text-muted-foreground mb-3">
            PatchPulse offers free and premium (&quot;Pro&quot;) subscription tiers.
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
            <li><span className="text-foreground font-medium">Billing:</span> Pro subscriptions are billed through Stripe (web) or Apple App Store (iOS). Payment terms are governed by the respective payment processor.</li>
            <li><span className="text-foreground font-medium">Auto-Renewal:</span> Subscriptions automatically renew unless cancelled before the end of the current billing period.</li>
            <li><span className="text-foreground font-medium">Cancellation:</span> You may cancel at any time through your account settings or the App Store. You will retain access until the end of your current billing period.</li>
            <li><span className="text-foreground font-medium">Refunds:</span> Refund policies are governed by the App Store or Stripe. We may offer refunds at our discretion for technical issues.</li>
            <li><span className="text-foreground font-medium">Price Changes:</span> We may change subscription prices with 30 days notice. Price changes will take effect at the start of your next billing period.</li>
          </ul>
        </section>

        {/* 5. Acceptable Use */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Acceptable Use</h2>
          <p className="text-muted-foreground mb-2">You agree not to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
            <li>Use the service for any unlawful purpose.</li>
            <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts.</li>
            <li>Interfere with or disrupt the service or servers.</li>
            <li>Scrape, crawl, or collect data from our service without permission.</li>
            <li>Use automated systems or bots to access the service.</li>
            <li>Reverse engineer, decompile, or disassemble any part of the service.</li>
            <li>Use the service to harass, abuse, or harm others.</li>
            <li>Circumvent any access controls or usage limits.</li>
          </ul>
        </section>

        {/* 6. Content and IP */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Content and Intellectual Property</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
            <li><span className="text-foreground font-medium">Third-Party Content:</span> Game names, logos, screenshots, and related content are trademarks and copyrights of their respective owners. PatchPulse does not claim ownership of any third-party content.</li>
            <li><span className="text-foreground font-medium">Our Content:</span> The PatchPulse name, logo, and original features are our intellectual property.</li>
            <li><span className="text-foreground font-medium">AI-Generated Content:</span> Summaries and recommendations generated by AI are provided for informational purposes only.</li>
            <li><span className="text-foreground font-medium">User Content:</span> You retain ownership of any content you create (such as notes or custom lists). By using the service, you grant us a license to use this content to provide the service.</li>
          </ul>
        </section>

        {/* 7. Third-Party Services */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">7. Third-Party Services</h2>
          <p className="text-muted-foreground">
            PatchPulse integrates with third-party services including Steam, Xbox, Epic Games Store, and others. Your use of these services is governed by their respective terms of service. We are not responsible for the availability, accuracy, or content of third-party services. Links to external stores and websites are provided for convenience only.
          </p>
        </section>

        {/* 8. Disclaimers */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">8. Disclaimers</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
            <li>The service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind.</li>
            <li>We do not guarantee the accuracy, completeness, or timeliness of game update information.</li>
            <li>We do not guarantee that the service will be uninterrupted or error-free.</li>
            <li>Price and deal information may be delayed or inaccurate; always verify before purchasing.</li>
            <li>AI-generated content may contain errors; use your own judgment.</li>
          </ul>
        </section>

        {/* 9. Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">9. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, PATCHPULSE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL, RESULTING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE PAST 12 MONTHS, OR $50, WHICHEVER IS GREATER.
          </p>
        </section>

        {/* 10. Indemnification */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">10. Indemnification</h2>
          <p className="text-muted-foreground">
            You agree to indemnify and hold harmless PatchPulse and its operators from any claims, damages, or expenses arising from your use of the service or violation of these terms.
          </p>
        </section>

        {/* 11. Termination */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">11. Termination</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
            <li>You may terminate your account at any time through the app settings.</li>
            <li>We may suspend or terminate your account for violations of these terms.</li>
            <li>Upon termination, your right to use the service ceases immediately.</li>
            <li>We may retain certain data as required by law or for legitimate business purposes.</li>
          </ul>
        </section>

        {/* 12. Changes */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">12. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these terms at any time. We will notify users of significant changes via the app or email. Your continued use of the service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        {/* 13. Governing Law */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">13. Governing Law</h2>
          <p className="text-muted-foreground">
            These terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through good-faith negotiation or, if necessary, binding arbitration.
          </p>
        </section>

        {/* 14. Severability */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">14. Severability</h2>
          <p className="text-muted-foreground">
            If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
          </p>
        </section>

        {/* 15. Contact */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">15. Contact</h2>
          <p className="text-muted-foreground">
            For questions about these Terms of Service, contact us at{' '}
            <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">
              {contactEmail}
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
