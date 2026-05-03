import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Sections';

export const metadata: Metadata = {
  title: 'Terms of Service — ChatToSales',
  description: 'Terms and conditions for using the ChatToSales platform.',
};

export default function TermsOfServicePage() {
  return (
    <div style={{ backgroundColor: 'var(--ds-bg-base)' }}>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1
          className="text-3xl font-bold"
          style={{ color: 'var(--ds-text-primary)' }}
        >
          Terms of Service
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
              1. Agreement
            </h2>
            <p>
              By using ChatToSales — whether through WhatsApp, our website at
              www.chattosales.com, or any connected service — you agree to these
              Terms of Service. If you do not agree, please do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              2. What ChatToSales is
            </h2>
            <p>
              ChatToSales is a commerce assistant that helps traders manage orders,
              catalogues, payments, and customer communication through WhatsApp.
              We are a tool for your business — we are not a marketplace, we do not
              buy or sell goods, and we do not hold your funds.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              3. Eligibility
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be at least 18 years old</li>
              <li>You must have a valid WhatsApp account</li>
              <li>You must provide accurate business information during signup</li>
              <li>You are responsible for all activity on your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              4. Your account
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your WhatsApp phone number is your primary identity on the platform</li>
              <li>You are responsible for keeping your login credentials secure</li>
              <li>Do not share your login links or OTP codes with anyone</li>
              <li>Notify us immediately if you suspect unauthorised access to your account</li>
              <li>We may suspend or terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              5. Acceptable use
            </h2>
            <p className="mb-3">You agree not to use ChatToSales to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sell illegal, counterfeit, or prohibited goods</li>
              <li>Send spam or unsolicited bulk messages</li>
              <li>Impersonate another person or business</li>
              <li>Attempt to access other traders' accounts or data</li>
              <li>Interfere with or disrupt the platform's operation</li>
              <li>Violate Meta's WhatsApp Business Policy or Commerce Policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              6. Orders and payments
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                ChatToSales facilitates communication between traders and customers.
                The contract of sale is between you (the trader) and your customer — not
                with ChatToSales.
              </li>
              <li>
                You are responsible for the accuracy of your product listings, prices,
                and availability.
              </li>
              <li>
                Payments are processed by Paystack and paid directly to your bank account.
                ChatToSales never holds, controls, or has access to your funds.
              </li>
              <li>
                Disputes between traders and customers are between those parties.
                ChatToSales does not mediate commercial disputes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              7. Subscription and pricing
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                ChatToSales offers free and paid tiers. The features and limits of
                each tier are described on our pricing page.
              </li>
              <li>
                All new accounts receive a 90-day free trial of all features.
              </li>
              <li>
                Paid subscriptions are billed monthly. You may cancel at any time —
                your account will revert to the free tier at the end of the billing period.
              </li>
              <li>
                We may change pricing with 30 days' notice via WhatsApp or email.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              8. AI-powered features
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                ChatToSales uses AI (including large language models) to process orders,
                extract product information, and generate business insights.
              </li>
              <li>
                AI outputs are provided as suggestions — you always have final say on
                order confirmations, pricing, and business decisions.
              </li>
              <li>
                AI processing is not perfect. We recommend reviewing extracted
                catalogues and order details for accuracy.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              9. Availability
            </h2>
            <p>
              We aim to keep ChatToSales available 24/7, but we do not guarantee
              uninterrupted service. Downtime may occur for maintenance, updates, or
              reasons beyond our control (including WhatsApp API outages). We are not
              liable for any losses caused by service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              10. Limitation of liability
            </h2>
            <p>
              ChatToSales is provided "as is" without warranties of any kind. To the
              maximum extent permitted by law, we are not liable for any indirect,
              incidental, or consequential damages arising from your use of the platform,
              including but not limited to lost revenue, missed orders, or incorrect
              AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              11. Termination
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You may stop using ChatToSales at any time</li>
              <li>
                We may suspend or terminate your account if you violate these terms,
                with notice where possible
              </li>
              <li>
                On termination, your data will be handled according to our Privacy Policy
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              12. Changes to these terms
            </h2>
            <p>
              We may update these terms from time to time. When we make significant
              changes, we will notify you via WhatsApp or through the dashboard.
              Continued use of the platform after changes take effect constitutes
              acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              13. Governing law
            </h2>
            <p>
              These terms are governed by the laws of the Federal Republic of Nigeria.
              Any disputes will be resolved in the courts of Lagos State, Nigeria.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text-primary)' }}>
              14. Contact
            </h2>
            <p>
              For questions about these terms, contact us at{' '}
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
