import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | PatchPulse',
  description: 'How PatchPulse collects, uses, and protects your data.',
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 3, 2025'
  const contactEmail = 'privacy@patchpulse.app'

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
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-8">
        {/* Introduction */}
        <p className="text-muted-foreground">
          PatchPulse (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our mobile application and website.
        </p>

        {/* 1. Information We Collect */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">1. Information We Collect</h2>

          <div className="space-y-3">
            <h3 className="font-medium text-foreground">1.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li><span className="text-foreground font-medium">Account Information:</span> Email address, display name, and profile picture when you create an account.</li>
              <li><span className="text-foreground font-medium">Gaming Preferences:</span> Games you follow, backlog entries, play status, and notification preferences.</li>
              <li><span className="text-foreground font-medium">Saved Content:</span> Bookmarked patches, news articles, and deals.</li>
              <li><span className="text-foreground font-medium">Payment Information:</span> When you subscribe to PatchPulse Pro, payment is processed by Stripe or Apple. We do not store your full credit card number.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-foreground">1.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li><span className="text-foreground font-medium">Device Information:</span> Device type, operating system, and unique device identifiers for push notifications.</li>
              <li><span className="text-foreground font-medium">Usage Data:</span> Features you use, content you view, and interaction patterns to improve our service.</li>
              <li><span className="text-foreground font-medium">Log Data:</span> IP address, browser type, and access times for security purposes.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-foreground">1.3 Information from Third Parties</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li><span className="text-foreground font-medium">Authentication Providers:</span> If you sign in with Google or Apple, we receive your email and profile information.</li>
              <li><span className="text-foreground font-medium">Gaming Platforms:</span> If you connect Steam, Xbox, or other accounts, we may receive your public profile and game library.</li>
            </ul>
          </div>
        </section>

        {/* 2. How We Use Your Information */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
            <li>Provide and maintain the service, including personalized game tracking and notifications.</li>
            <li>Send you notifications about patches, news, deals, and game releases for games you follow.</li>
            <li>Generate AI-powered recommendations and summaries based on your preferences.</li>
            <li>Process subscriptions and payments.</li>
            <li>Improve and optimize the service through analytics.</li>
            <li>Respond to your inquiries and provide customer support.</li>
            <li>Detect, prevent, and address technical issues and security threats.</li>
          </ul>
        </section>

        {/* 3. AI Features */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. AI-Powered Features</h2>
          <p className="text-muted-foreground">
            PatchPulse uses artificial intelligence to provide personalized game recommendations, summarized patch notes, and smart notification prioritization. Your gaming preferences may be processed by our AI providers (Anthropic and OpenAI) to generate these features. This data is used solely to provide the service and is not used to train AI models.
          </p>
        </section>

        {/* 4. Data Sharing */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">4. How We Share Your Information</h2>
          <p className="text-muted-foreground">We do not sell your personal information. We may share your data with:</p>

          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Service Providers</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
              <li><span className="text-foreground font-medium">Supabase:</span> Database and authentication</li>
              <li><span className="text-foreground font-medium">Stripe:</span> Payment processing</li>
              <li><span className="text-foreground font-medium">Apple:</span> In-app purchases and push notifications</li>
              <li><span className="text-foreground font-medium">Vercel:</span> Hosting and infrastructure</li>
              <li><span className="text-foreground font-medium">Anthropic/OpenAI:</span> AI features</li>
            </ul>
          </div>

          <p className="text-muted-foreground">
            We may also disclose information if required by law or to protect the rights, property, or safety of PatchPulse, our users, or the public.
          </p>
        </section>

        {/* 5. Data Retention */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Data Retention</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
            <li><span className="text-foreground font-medium">Account data:</span> Retained until you delete your account.</li>
            <li><span className="text-foreground font-medium">Notification history:</span> Automatically deleted after 30 days.</li>
            <li><span className="text-foreground font-medium">Payment records:</span> Retained for 7 years for legal compliance.</li>
          </ul>
        </section>

        {/* 6. Your Rights */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Your Rights and Choices</h2>
          <p className="text-muted-foreground mb-2">Depending on your location, you may have the right to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
            <li><span className="text-foreground font-medium">Access:</span> Request a copy of your personal data.</li>
            <li><span className="text-foreground font-medium">Correction:</span> Update or correct inaccurate information.</li>
            <li><span className="text-foreground font-medium">Deletion:</span> Request deletion of your account and data.</li>
            <li><span className="text-foreground font-medium">Portability:</span> Receive your data in a portable format.</li>
            <li><span className="text-foreground font-medium">Opt-out:</span> Disable push notifications or unsubscribe from emails.</li>
          </ul>
          <p className="text-muted-foreground mt-3">
            To exercise these rights, contact us at{' '}
            <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a>{' '}
            or use the account settings in the app.
          </p>
        </section>

        {/* 7. Security */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">7. Data Security</h2>
          <p className="text-muted-foreground">
            We implement industry-standard security measures including encryption of data in transit (HTTPS/TLS) and at rest, secure authentication with password hashing, and row-level security policies. However, no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        {/* 8. International Transfers */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">8. International Data Transfers</h2>
          <p className="text-muted-foreground">
            Your information may be transferred to and processed in countries other than your own, including the United States. By using the service, you consent to the transfer of your information to these countries.
          </p>
        </section>

        {/* 9. Children */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">9. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground">
            PatchPulse is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe your child has provided us with personal information, please contact us.
          </p>
        </section>

        {/* 10. Third-Party Links */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">10. Third-Party Links</h2>
          <p className="text-muted-foreground">
            The service may contain links to third-party websites or stores (Steam, Epic Games Store, GOG, etc.). We are not responsible for the privacy practices of these third parties.
          </p>
        </section>

        {/* 11. Changes */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">11. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy and updating the &quot;Last updated&quot; date. Your continued use of the service constitutes acceptance of the updated policy.
          </p>
        </section>

        {/* GDPR */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">For EU/EEA Users (GDPR)</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
            <li><span className="text-foreground font-medium">Legal Basis:</span> We process your data based on consent, contract performance, legitimate interests, or legal obligations.</li>
            <li><span className="text-foreground font-medium">Data Controller:</span> PatchPulse is the data controller for your personal information.</li>
            <li><span className="text-foreground font-medium">Right to Complain:</span> You may lodge a complaint with your local data protection authority.</li>
          </ul>
        </section>

        {/* CCPA */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">For California Users (CCPA)</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
            <li><span className="text-foreground font-medium">Right to Know:</span> Request information about personal data collected.</li>
            <li><span className="text-foreground font-medium">Right to Delete:</span> Request deletion of your personal information.</li>
            <li><span className="text-foreground font-medium">No Sale of Data:</span> We do not sell your personal information to third parties.</li>
          </ul>
        </section>

        {/* Contact */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">12. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a>
          </p>
        </section>
      </div>
    </div>
  )
}
