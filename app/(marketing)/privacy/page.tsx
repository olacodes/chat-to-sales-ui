import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Sections';

export const metadata: Metadata = {
  title: 'Privacy Policy — ChatToSales',
  description: 'How ChatToSales collects, uses, and protects your information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ backgroundColor: 'var(--ds-bg-base)' }}>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1
          className="text-3xl font-bold"
          style={{ color: 'var(--ds-text-primary)' }}
        >
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>
          Last updated: 1 May 2026
        </p>

        <div
          className="mt-8 space-y-8 text-sm leading-relaxed"
          style={{ color: 'var(--ds-text-secondary)' }}
        >
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              1. Who we are
            </h2>
            <p>
              ChatToSales ("we", "us", "our") is a WhatsApp commerce assistant that helps
              traders in Nigeria manage orders, track payments, and grow their business
              directly through WhatsApp. Our website is{' '}
              <span className="font-medium" style={{ color: 'var(--ds-text-primary)' }}>
                www.chattosales.com
              </span>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              2. Information we collect
            </h2>
            <p className="mb-3">We collect only what is necessary to provide the service:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium" style={{ color: 'var(--ds-text-primary)' }}>Account information:</span>{' '}
                Your WhatsApp phone number, business name, and business category. If you
                sign up via email, we also store your email address and a hashed password.
              </li>
              <li>
                <span className="font-medium" style={{ color: 'var(--ds-text-primary)' }}>WhatsApp messages:</span>{' '}
                Messages you and your customers send through the ChatToSales platform number
                or your connected WhatsApp Business number. These are used to process orders,
                manage your catalogue, and provide business intelligence.
              </li>
              <li>
                <span className="font-medium" style={{ color: 'var(--ds-text-primary)' }}>Order and payment data:</span>{' '}
                Order details (items, quantities, prices), payment status, and customer
                contact information provided during the ordering process.
              </li>
              <li>
                <span className="font-medium" style={{ color: 'var(--ds-text-primary)' }}>Media files:</span>{' '}
                Photos of price lists and voice notes you send during onboarding or catalogue
                updates. These are processed to extract product and pricing information and
                are not stored permanently.
              </li>
              <li>
                <span className="font-medium" style={{ color: 'var(--ds-text-primary)' }}>Usage data:</span>{' '}
                Basic analytics such as login timestamps and feature usage to improve the
                service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              3. How we use your information
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process and manage orders between you and your customers</li>
              <li>Build and maintain your product catalogue</li>
              <li>Send order notifications, confirmations, and reminders via WhatsApp</li>
              <li>Generate business reports and insights</li>
              <li>Track debts and send payment reminders</li>
              <li>Process payments through our payment partner (Paystack)</li>
              <li>Authenticate your identity when you log in</li>
              <li>Improve and develop new features for the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              4. Third-party services
            </h2>
            <p className="mb-3">We share data with the following third parties only as needed to operate the service:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium" style={{ color: 'var(--ds-text-primary)' }}>Meta (WhatsApp Business API):</span>{' '}
                To send and receive WhatsApp messages on your behalf. Subject to{' '}
                <a href="https://www.whatsapp.com/legal/business-policy" target="_blank" rel="noopener noreferrer" className="underline">
                  Meta's WhatsApp Business Policy
                </a>.
              </li>
              <li>
                <span className="font-medium" style={{ color: 'var(--ds-text-primary)' }}>Paystack:</span>{' '}
                To process payments. Paystack receives the payment amount and customer
                contact details. Funds are paid directly to the trader's bank account —
                we never hold your funds. Subject to{' '}
                <a href="https://paystack.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
                  Paystack's Privacy Policy
                </a>.
              </li>
              <li>
                <span className="font-medium" style={{ color: 'var(--ds-text-primary)' }}>Google Cloud (Vision API):</span>{' '}
                To read text from photos of price lists during onboarding. The image is
                sent to Google for OCR processing and is not retained by Google.
              </li>
              <li>
                <span className="font-medium" style={{ color: 'var(--ds-text-primary)' }}>OpenAI (Whisper):</span>{' '}
                To transcribe voice notes into text. Audio is sent for transcription
                and is not retained.
              </li>
              <li>
                <span className="font-medium" style={{ color: 'var(--ds-text-primary)' }}>Anthropic (Claude):</span>{' '}
                To extract product information from text and assist with order processing.
                Message content is sent for AI processing and is not used to train models.
              </li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or trade your personal information to anyone.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              5. Data security
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>WhatsApp access tokens are encrypted at rest in our database — never stored in plaintext</li>
              <li>Passwords are hashed using industry-standard algorithms — we cannot read them</li>
              <li>All connections use HTTPS/TLS encryption in transit</li>
              <li>Login sessions use short-lived JWT tokens stored in memory, not cookies</li>
              <li>We use rate limiting to prevent brute-force attacks on login endpoints</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              6. Data retention
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your account data is kept for as long as your account is active</li>
              <li>Order history is retained to provide business reports and insights</li>
              <li>Media files (photos, voice notes) are processed and discarded — not stored permanently</li>
              <li>If you delete your account, your personal data will be removed within 30 days. Anonymised, aggregated data may be retained for analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              7. Your rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your order and catalogue data</li>
              <li>Withdraw consent for data processing (which may require closing your account)</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, send a WhatsApp message to our platform
              number or email us at{' '}
              <span className="font-medium" style={{ color: 'var(--ds-text-primary)' }}>
                info.chattosales@gmail.com
              </span>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              8. Children
            </h2>
            <p>
              ChatToSales is designed for business use and is not intended for children
              under 18. We do not knowingly collect information from children. If you
              believe a child has provided us with personal data, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              9. Changes to this policy
            </h2>
            <p>
              We may update this privacy policy from time to time. When we make changes,
              we will update the "Last updated" date at the top. For significant changes,
              we will notify you via WhatsApp or through the dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              10. Contact us
            </h2>
            <p>
              If you have questions about this privacy policy or how we handle your data,
              contact us at{' '}
              <span className="font-medium" style={{ color: 'var(--ds-text-primary)' }}>
                info.chattosales@gmail.com
              </span>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
