import Link from 'next/link'

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">&larr; Back to Home</Link>
        </div>

        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Terms of Service</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last updated: October 12, 2025</p>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">1. Agreement to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              By accessing or using NomadCrypto Hub ("Service"), you agree to be bound by these Terms of Service ("Terms").
              If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">2. Description of Service</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              NomadCrypto Hub provides:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Tax simulation tools for cryptocurrency taxation across multiple countries</li>
              <li>DeFi transaction auditing and tax categorization</li>
              <li>AI-powered tax assistance and guidance</li>
              <li>PDF report generation</li>
              <li>Access to tax regulation data for 98+ countries</li>
            </ul>
          </section>

          {/* Important Disclaimers */}
          <section className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-6">
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">⚠️ 3. Important Disclaimers</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="font-semibold">NOT FINANCIAL OR LEGAL ADVICE:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The Service provides <strong>general information only</strong> and is NOT financial, legal, or tax advice</li>
                <li>Results may contain errors, inaccuracies, or be outdated</li>
                <li>Tax laws change frequently and vary by jurisdiction</li>
                <li>You MUST consult with licensed tax professionals, accountants, and lawyers before making any decisions</li>
                <li>We are NOT responsible for any losses, penalties, or legal issues arising from use of our Service</li>
              </ul>

              <p className="font-semibold mt-4">NO GUARANTEES:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We make no guarantees about accuracy, completeness, or reliability of information</li>
                <li>Tax regulations displayed may be outdated or incorrect</li>
                <li>AI responses may be inaccurate or misleading</li>
                <li>DeFi audit results may miss transactions or miscategorize tax treatment</li>
              </ul>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">4. User Accounts</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              When you create an account with us, you must:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Not share your account with others</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be at least 18 years of age</li>
            </ul>
          </section>

          {/* Subscription and Payments */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">5. Subscription and Payments</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>Free Tier:</strong> Limited features with usage quotas</p>
              <p><strong>Paid Tiers:</strong> STARTER ($20/month), PRO ($50/month), ENTERPRISE (custom pricing)</p>

              <p className="mt-3">Payment terms:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payments are processed securely via Paddle (our Merchant of Record)</li>
                <li>Subscriptions renew automatically unless cancelled</li>
                <li>You can cancel anytime from your account settings</li>
                <li>No refunds for partial months</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
              </ul>
            </div>
          </section>

          {/* Usage Limits */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">6. Usage Limits and Fair Use</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Each subscription tier has monthly usage limits:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>FREE: 5 simulations, 0 DeFi audits, 20 chat messages</li>
              <li>STARTER: 50 simulations, 5 DeFi audits, 200 chat messages</li>
              <li>PRO: 500 simulations, 50 DeFi audits, 2000 chat messages</li>
              <li>ENTERPRISE: Unlimited with fair use policy</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              We reserve the right to suspend accounts that abuse the service or exceed fair use limits.
            </p>
          </section>

          {/* Prohibited Uses */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">7. Prohibited Uses</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">You may NOT:</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Attempt to hack, reverse engineer, or compromise the Service</li>
              <li>Scrape, data mine, or extract data in bulk</li>
              <li>Use the Service to provide tax advice to others commercially</li>
              <li>Share your account credentials or subscription with others</li>
              <li>Upload malicious code or attempt DDoS attacks</li>
              <li>Impersonate others or provide false information</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">8. Intellectual Property</h2>
            <p className="text-gray-700 dark:text-gray-300">
              The Service and its original content, features, and functionality are owned by NomadCrypto Hub and are
              protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          {/* Data Privacy */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">9. Data and Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your use of the Service is also governed by our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
              We collect and use data as described in that policy.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">10. Termination</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may terminate or suspend your account and access immediately, without prior notice or liability,
              for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
            </p>
          </section>

          {/* User Responsibilities */}
          <section className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 my-6">
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">11. Your Responsibilities</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="font-semibold">YOU ARE SOLELY RESPONSIBLE FOR:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your tax compliance in all relevant jurisdictions</li>
                <li>Verifying all information provided by the Service with qualified professionals</li>
                <li>Filing accurate and timely tax returns</li>
                <li>Maintaining records of all cryptocurrency transactions</li>
                <li>Understanding and complying with the tax laws of your jurisdiction(s)</li>
                <li>Any consequences arising from your use or misuse of the Service</li>
              </ul>
              <p className="mt-3">
                <strong>You acknowledge that:</strong> The Service provides estimations and general information only.
                You must independently verify all tax calculations and seek professional advice before making any tax filings or financial decisions.
              </p>
            </div>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">12. Indemnification</h2>
            <p className="text-gray-700 dark:text-gray-300">
              You agree to defend, indemnify, and hold harmless NomadCrypto Hub, its owners, employees, contractors, and
              affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-3">
              <li>Your use or misuse of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Tax penalties, audits, or legal issues related to your tax filings</li>
              <li>Any inaccurate information you provide</li>
              <li>Your reliance on Service outputs without professional verification</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 my-6">
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">13. Limitation of Liability</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="font-semibold">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>NomadCrypto Hub shall NOT be liable for any indirect, incidental, special, consequential, or punitive damages</li>
                <li>We are NOT liable for tax penalties, audits, legal issues, fines, or financial losses resulting from use of the Service</li>
                <li>We are NOT liable for errors in blockchain data, transaction categorization, or tax calculations</li>
                <li>We are NOT liable for outdated or incorrect tax regulations displayed in the Service</li>
                <li>Our total liability shall not exceed the lesser of: (a) $100 USD, or (b) the amount paid by you in the past 12 months</li>
                <li>The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, express or implied</li>
                <li>We make NO WARRANTY that the Service will be error-free, accurate, or uninterrupted</li>
              </ul>
            </div>
          </section>

          {/* Blockchain Data Disclaimer */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">14. Blockchain Data and DeFi Audit Disclaimer</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>Regarding DeFi audits and on-chain transaction analysis:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Blockchain data may be incomplete, incorrect, or fail to capture all transactions</li>
                <li>Transaction categorization is automated and may be incorrect</li>
                <li>Some protocols, DEXs, or chains may not be supported or may have incomplete data</li>
                <li>Smart contract interactions may be misinterpreted</li>
                <li>You MUST manually verify all transactions and their tax treatment</li>
                <li>We are NOT responsible for missed transactions or incorrect categorization</li>
              </ul>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">15. Governing Law and Dispute Resolution</h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-3">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of Seychelles,
                without regard to its conflict of law provisions.
              </p>
              <p>
                Any dispute arising from these Terms or your use of the Service shall be resolved through
                binding arbitration in Victoria, Seychelles, in accordance with the Seychelles International
                Arbitration Act. You waive any right to a jury trial or to participate in a class action lawsuit.
              </p>
              <p>
                <strong>Exception:</strong> Either party may seek injunctive relief in any court of competent jurisdiction
                to protect intellectual property rights.
              </p>
            </div>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">16. Severability</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be
              limited or eliminated to the minimum extent necessary so that the remaining Terms remain in full force and effect.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">17. Changes to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by
              updating the "Last updated" date and, for registered users, by email. Your continued use of the Service
              after changes constitutes acceptance of the new Terms. If you do not agree to the modified Terms,
              you must stop using the Service.
            </p>
          </section>

          {/* Entire Agreement */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">18. Entire Agreement</h2>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms, together with our Privacy Policy and any other legal notices published by us on the Service,
              constitute the entire agreement between you and NomadCrypto Hub concerning the Service.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">19. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have questions about these Terms, please contact us at:<br />
              <strong>legal@cryptonomadhub.com</strong>
            </p>
          </section>
        </div>

        {/* Acceptance */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Acceptance of Terms</h3>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              By creating an account, clicking "I Accept", or by using the Service, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You have read and understood these Terms of Service in their entirety</li>
              <li>You have read and understood our Privacy Policy</li>
              <li>You understand this Service is NOT financial, tax, or legal advice</li>
              <li>You are solely responsible for your tax compliance and will verify all information with licensed professionals</li>
              <li>You agree to indemnify and hold harmless NomadCrypto Hub from any claims or damages</li>
              <li>You accept all limitations of liability and disclaimers stated herein</li>
            </ul>
            <p className="mt-4 font-semibold">
              IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THE SERVICE.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
