'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { PublicPageLayout } from '@/components/PublicPageLayout'
import { ArrowLeft, Building2, Mail, Cookie, Shield, FileText, Globe } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LegalNotice() {
  return (
    <PublicPageLayout contentClassName="bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Legal Notice</h1>
              <p className="text-white/80 text-sm mt-2">Mentions légales • Last updated: October 28, 2025</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Site Publisher */}
          <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  1. Site Publisher / Éditeur du site
                </h2>
              </div>
            </div>

            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Company Name:</div>
                  <div>Fractal Corp Limited</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">IBC Number:</div>
                  <div>239950</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Globe className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Website:</div>
                  <div>
                    <a href="https://cryptonomadhub.io" className="text-violet-600 dark:text-violet-400 hover:underline">
                      https://cryptonomadhub.io
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Contact:</div>
                  <div>
                    <a href="mailto:contact@cryptonomadhub.io" className="text-violet-600 dark:text-violet-400 hover:underline">
                      contact@cryptonomadhub.io
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Cookie Policy */}
          <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Cookie className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  2. Cookie Policy / Politique des cookies
                </h2>
              </div>
            </div>

            <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
              CryptoNomadHub uses cookies to enhance your browsing experience, analyze site traffic, and personalize content.
              By using our website, you consent to our use of cookies in accordance with this policy.
            </p>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Types of Cookies We Use:</h3>

            <div className="space-y-4">
              {/* Essential Cookies */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-bold text-green-900 dark:text-green-100">Essential Cookies (Required)</h4>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  Necessary for the website to function properly. These cookies enable core functionalities such as security,
                  authentication, and session management.
                </p>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-green-200 dark:border-green-900">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-600 dark:text-slate-400">
                        <th className="pb-2">Cookie Name</th>
                        <th className="pb-2">Purpose</th>
                        <th className="pb-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-700">
                      <tr>
                        <td className="py-2 font-mono text-xs">session_id</td>
                        <td className="py-2">User session management</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">csrf_token</td>
                        <td className="py-2">Security protection</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">auth_token</td>
                        <td className="py-2">Authentication</td>
                        <td className="py-2">7 days</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">cookieConsent</td>
                        <td className="py-2">Store cookie preferences</td>
                        <td className="py-2">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-2">
                  <Cookie className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-bold text-blue-900 dark:text-blue-100">Analytics Cookies (Optional)</h4>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-blue-200 dark:border-blue-900">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-600 dark:text-slate-400">
                        <th className="pb-2">Cookie Name</th>
                        <th className="pb-2">Purpose</th>
                        <th className="pb-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-700">
                      <tr>
                        <td className="py-2 font-mono text-xs">_ga</td>
                        <td className="py-2">Google Analytics - visitor ID</td>
                        <td className="py-2">2 years</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">_gid</td>
                        <td className="py-2">Google Analytics - session ID</td>
                        <td className="py-2">24 hours</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">_gat</td>
                        <td className="py-2">Google Analytics - request throttle</td>
                        <td className="py-2">1 minute</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-2">
                  <Cookie className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-bold text-purple-900 dark:text-purple-100">Marketing Cookies (Optional)</h4>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  Used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.
                </p>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-purple-200 dark:border-purple-900">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-600 dark:text-slate-400">
                        <th className="pb-2">Cookie Name</th>
                        <th className="pb-2">Purpose</th>
                        <th className="pb-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-700">
                      <tr>
                        <td className="py-2 font-mono text-xs">_fbp</td>
                        <td className="py-2">Facebook Pixel - ad tracking</td>
                        <td className="py-2">3 months</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">fr</td>
                        <td className="py-2">Facebook - ad targeting</td>
                        <td className="py-2">3 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
              <h4 className="font-bold text-violet-900 dark:text-violet-100 mb-2">Managing Your Cookie Preferences</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                You can change your cookie preferences at any time by:
              </p>
              <ul className="list-disc pl-6 mt-2 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <li>Clicking the cookie icon in the footer of any page</li>
                <li>Adjusting your browser settings to refuse or delete cookies</li>
                <li>Contacting us at{' '}
                  <a href="mailto:contact@cryptonomadhub.io" className="text-violet-600 dark:text-violet-400 hover:underline">
                    contact@cryptonomadhub.io
                  </a>
                </li>
              </ul>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                <strong>Note:</strong> Disabling essential cookies may affect the functionality of the website.
              </p>
            </div>
          </motion.section>

          {/* Personal Data */}
          <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  3. Personal Data / Données personnelles
                </h2>
              </div>
            </div>

            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Data We Collect:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Information:</strong> Email address, username, password (hashed)</li>
                  <li><strong>Profile Data:</strong> Country, income level, crypto portfolio value (optional)</li>
                  <li><strong>Usage Data:</strong> IP address, browser type, pages visited, time spent</li>
                  <li><strong>Blockchain Data:</strong> Wallet addresses (if connected), transaction history</li>
                  <li><strong>Communication:</strong> Support tickets, feedback, contact form submissions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">How We Use Your Data:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and improve our services</li>
                  <li>Personalize your experience and recommendations</li>
                  <li>Process transactions and send notifications</li>
                  <li>Respond to customer support requests</li>
                  <li>Analyze usage patterns and optimize performance</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Data Retention:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Data:</strong> Retained until account deletion + 30 days</li>
                  <li><strong>Analytics Data:</strong> Anonymized after 26 months (Google Analytics default)</li>
                  <li><strong>Support Tickets:</strong> Retained for 3 years for legal compliance</li>
                  <li><strong>Cookies:</strong> Duration varies by type (see Cookie Policy above)</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* GDPR Rights */}
          <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  4. Your Rights (GDPR / RGPD)
                </h2>
              </div>
            </div>

            <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
              If you are in the European Union or European Economic Area, you have the following rights under the General Data Protection Regulation (GDPR):
            </p>

            <div className="space-y-3">
              {[
                {
                  right: 'Right to Access',
                  description: 'Request a copy of all personal data we hold about you'
                },
                {
                  right: 'Right to Rectification',
                  description: 'Request correction of inaccurate or incomplete data'
                },
                {
                  right: 'Right to Erasure ("Right to be Forgotten")',
                  description: 'Request deletion of your personal data in certain circumstances'
                },
                {
                  right: 'Right to Restrict Processing',
                  description: 'Request limitation of how we process your data'
                },
                {
                  right: 'Right to Data Portability',
                  description: 'Receive your data in a structured, machine-readable format'
                },
                {
                  right: 'Right to Object',
                  description: 'Object to processing of your data for specific purposes'
                },
                {
                  right: 'Right to Withdraw Consent',
                  description: 'Withdraw consent for data processing at any time'
                },
                {
                  right: 'Right to Lodge a Complaint',
                  description: 'File a complaint with your local data protection authority'
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{item.right}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
              <h4 className="font-bold text-violet-900 dark:text-violet-100 mb-2">How to Exercise Your Rights:</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                To exercise any of these rights, please contact us at:
              </p>
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <Mail className="w-5 h-5" />
                <a href="mailto:contact@cryptonomadhub.io" className="font-semibold hover:underline">
                  contact@cryptonomadhub.io
                </a>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-3">
                We will respond to your request within <strong>30 days</strong> as required by GDPR.
              </p>
            </div>
          </motion.section>

          {/* Disclaimer */}
          <motion.section variants={fadeInUp} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-amber-300 dark:border-amber-700 shadow-xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-amber-900 dark:text-amber-100">
                  5. Important Disclaimer / Avertissement
                </h2>
              </div>
            </div>

            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p className="font-bold text-amber-900 dark:text-amber-100">
                NOT FINANCIAL, TAX, OR LEGAL ADVICE
              </p>
              <p>
                CryptoNomadHub provides <strong>informational tools and data</strong> only. We are NOT:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>A tax advisor, accountant, or financial advisor</li>
                <li>A law firm or legal service provider</li>
                <li>A licensed financial institution</li>
              </ul>
              <p className="font-bold text-red-700 dark:text-red-400">
                You MUST consult with licensed professionals (tax advisors, accountants, lawyers) before making any financial,
                tax, or legal decisions. Tax laws vary by jurisdiction and change frequently.
              </p>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  6. Contact Us / Nous contacter
                </h2>
              </div>
            </div>

            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              For any questions, concerns, or requests regarding this Legal Notice, Cookie Policy, Privacy Policy,
              or your personal data, please contact us:
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
                <Mail className="w-6 h-6 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Email:</div>
                  <a href="mailto:contact@cryptonomadhub.io" className="text-violet-600 dark:text-violet-400 hover:underline">
                    contact@cryptonomadhub.io
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
                <Globe className="w-6 h-6 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Company:</div>
                  <div className="text-slate-700 dark:text-slate-300">
                    Fractal Corp Limited (IBC 239950)
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Response Time:</strong> We aim to respond to all inquiries within 48 hours (2 business days).
                GDPR requests will be processed within 30 days as required by law.
              </p>
            </div>
          </motion.section>

          {/* Links to Other Pages */}
          <motion.section variants={fadeInUp} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-8 text-white shadow-xl">
            <h3 className="text-2xl font-bold mb-4">Related Legal Documents</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/privacy"
                className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-6 h-6" />
                  <div className="font-bold text-lg">Privacy Policy</div>
                </div>
                <div className="text-sm text-white/80 group-hover:text-white">
                  How we collect, use, and protect your personal information
                </div>
              </Link>

              <Link
                href="/terms"
                className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6" />
                  <div className="font-bold text-lg">Terms of Service</div>
                </div>
                <div className="text-sm text-white/80 group-hover:text-white">
                  Rules and conditions for using CryptoNomadHub
                </div>
              </Link>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </PublicPageLayout>
  )
}
