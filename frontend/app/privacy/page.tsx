import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">&larr; Back to Home</Link>
        </div>

        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last updated: October 12, 2025</p>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">1. Introduction</h2>
            <p className="text-gray-700 dark:text-gray-300">
              NomadCrypto Hub ("we", "our", "us") respects your privacy and is committed to protecting your personal data.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white mt-4">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Account Information:</strong> Email address, password (hashed)</li>
              <li><strong>Profile Data:</strong> Current country of residence</li>
              <li><strong>Payment Information:</strong> Processed securely by Paddle (we do NOT store credit card details)</li>
              <li><strong>Simulation Data:</strong> Tax simulation inputs (countries, amounts, dates)</li>
              <li><strong>DeFi Audit Data:</strong> Wallet addresses, blockchain transaction data</li>
              <li><strong>Chat Messages:</strong> Questions and conversations with our AI assistant</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white mt-4">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
              <li><strong>Cookies:</strong> Session cookies for authentication and functionality</li>
              <li><strong>Log Data:</strong> API requests, errors, performance metrics</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">3. How We Use Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Provide, operate, and maintain the Service</li>
              <li>Process your tax simulations and DeFi audits</li>
              <li>Manage your account and subscription</li>
              <li>Send you service updates, security alerts, and administrative messages</li>
              <li>Respond to your comments, questions, and support requests</li>
              <li>Monitor and analyze usage patterns to improve the Service</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 my-6">
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">4. Data Storage and Security</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>Where We Store Data:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Servers located in secure data centers (Europe/US)</li>
                <li>Database: PostgreSQL with encryption at rest</li>
                <li>Backups: Encrypted daily backups with 7-day retention</li>
              </ul>

              <p className="mt-3"><strong>Security Measures:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>HTTPS encryption for all data transmission</li>
                <li>Password hashing using bcrypt</li>
                <li>Rate limiting to prevent abuse</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication</li>
              </ul>

              <p className="mt-3 font-semibold">
                ⚠️ Important: No security system is 100% secure. We cannot guarantee absolute security of your data.
              </p>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">5. How We Share Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">We do NOT sell your personal data. We may share data with:</p>

            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white mt-4">5.1 Service Providers</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Paddle:</strong> Payment processing (Merchant of Record)</li>
              <li><strong>Sentry:</strong> Error tracking and monitoring</li>
              <li><strong>Email Service:</strong> Transactional emails (verification, password reset)</li>
              <li><strong>Cloud Infrastructure:</strong> Hosting and storage providers</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white mt-4">5.2 Legal Requirements</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We may disclose your information if required by law, court order, or government request,
              or to protect our rights, property, or safety.
            </p>
          </section>

          {/* Blockchain Data */}
          <section className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-6">
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">6. Blockchain and Wallet Data</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>Important Notice:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>When you provide a wallet address for DeFi audit, we query <strong>public blockchain data</strong></li>
                <li>Blockchain data is <strong>publicly accessible</strong> by anyone</li>
                <li>We store wallet addresses and transaction data to provide the audit service</li>
                <li>This data may include transaction amounts, timestamps, and protocol interactions</li>
                <li>You can delete your audit data anytime from your account</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">7. Your Privacy Rights</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your simulation and audit data</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing emails (we send very few)</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              To exercise these rights, contact us at <strong>privacy@cryptonomadhub.com</strong>
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">8. Data Retention</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>We retain your data for as long as your account is active, plus:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Until you delete your account + 30 days</li>
                <li><strong>Simulation History:</strong> Until you delete or close account</li>
                <li><strong>Payment Records:</strong> 7 years (legal requirement)</li>
                <li><strong>Log Data:</strong> 90 days</li>
                <li><strong>Backups:</strong> 7 days rolling retention</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">9. Cookies and Tracking</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">We use cookies for:</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Essential Cookies:</strong> Authentication, session management (required)</li>
              <li><strong>Analytics Cookies:</strong> Understanding usage patterns (can be disabled)</li>
              <li><strong>Preference Cookies:</strong> Remembering your settings</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              You can control cookies through your browser settings. Disabling essential cookies may affect functionality.
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">10. Third-Party Links</h2>
            <p className="text-gray-700 dark:text-gray-300">
              The Service may contain links to third-party websites (e.g., Paddle payment page, government tax authority sites).
              We are not responsible for the privacy practices of these sites. We encourage you to read their privacy policies.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">11. Children's Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              The Service is not intended for users under 18 years of age. We do not knowingly collect data from children.
              If we discover we have collected data from a child, we will delete it immediately.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">12. International Data Transfers</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your data may be transferred to and stored in countries other than your own.
              These countries may have different data protection laws. By using the Service, you consent to such transfers.
            </p>
          </section>

          {/* GDPR */}
          <section className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-6">
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">13. GDPR Compliance (EU Users)</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>If you are in the European Union, you have additional rights under GDPR:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Right to be informed about data processing</li>
                <li>Right to access your data</li>
                <li>Right to rectification</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
              </ul>
              <p className="mt-3">
                <strong>Legal Basis for Processing:</strong> Contract performance, legal obligations, and legitimate interests
              </p>
            </div>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">14. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the
              "Last updated" date and, for significant changes, by email or prominent notice on the Service.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">15. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have questions about this Privacy Policy or want to exercise your privacy rights, contact us at:
            </p>
            <div className="mt-3 text-gray-700 dark:text-gray-300">
              <p><strong>Email:</strong> privacy@cryptonomadhub.com</p>
              <p><strong>Data Protection Officer:</strong> dpo@cryptonomadhub.com</p>
              <p className="mt-2">
                <strong>Address:</strong><br />
                NomadCrypto Hub<br />
                [Your Company Address]<br />
                Seychelles
              </p>
            </div>
          </section>
        </div>

        {/* Summary Box */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Privacy in Summary</h3>
          <ul className="text-gray-700 dark:text-gray-300 space-y-2">
            <li>✅ We collect only what's necessary to provide the Service</li>
            <li>✅ We do NOT sell your data to third parties</li>
            <li>✅ Your data is encrypted and securely stored</li>
            <li>✅ You can delete your account and data anytime</li>
            <li>✅ We comply with GDPR and data protection laws</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
