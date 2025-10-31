'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { PublicPageSSR } from '@/components/PublicPageSSR'
import { ArrowLeft, Shield, Lock, Database, Globe, Mail, CheckCircle2, FileText } from 'lucide-react'

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

export default function PrivacyPolicy() {
  return (
    <PublicPageSSR contentClassName="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20">
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
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
                <p className="text-white/80 text-sm mt-2">Last updated: October 12, 2025</p>
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
            {/* Introduction */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                1. Introduction
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                CryptoNomadHub ("we", "our", "us") respects your privacy and is committed to protecting your personal data.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
            </motion.section>

            {/* Information We Collect */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                2. Information We Collect
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">2.1 Information You Provide</h3>
                  <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                    <li><strong className="text-violet-600 dark:text-fuchsia-400">Account Information:</strong> Email address, password (hashed)</li>
                    <li><strong className="text-violet-600 dark:text-fuchsia-400">Profile Data:</strong> Current country of residence</li>
                    <li><strong className="text-violet-600 dark:text-fuchsia-400">Payment Information:</strong> Processed securely by Paddle (we do NOT store credit card details)</li>
                    <li><strong className="text-violet-600 dark:text-fuchsia-400">Simulation Data:</strong> Tax simulation inputs (countries, amounts, dates)</li>
                    <li><strong className="text-violet-600 dark:text-fuchsia-400">DeFi Audit Data:</strong> Wallet addresses, blockchain transaction data</li>
                    <li><strong className="text-violet-600 dark:text-fuchsia-400">Chat Messages:</strong> Questions and conversations with our AI assistant</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">2.2 Information Collected Automatically</h3>
                  <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                    <li><strong className="text-violet-600 dark:text-fuchsia-400">Usage Data:</strong> Pages visited, features used, time spent</li>
                    <li><strong className="text-violet-600 dark:text-fuchsia-400">Device Information:</strong> IP address, browser type, operating system</li>
                    <li><strong className="text-violet-600 dark:text-fuchsia-400">Cookies:</strong> Session cookies for authentication and functionality</li>
                    <li><strong className="text-violet-600 dark:text-fuchsia-400">Log Data:</strong> API requests, errors, performance metrics</li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* How We Use Your Information */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                3. How We Use Your Information
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Provide, operate, and maintain the Service</li>
                <li>Process your tax simulations and DeFi audits</li>
                <li>Manage your account and subscription</li>
                <li>Send you service updates, security alerts, and administrative messages</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Monitor and analyze usage patterns to improve the Service</li>
                <li>Detect, prevent, and address technical issues and fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </motion.section>

            {/* Data Storage and Security */}
            <motion.section variants={fadeInUp} className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-8 border-l-4 border-emerald-500 shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-emerald-900 dark:text-emerald-200">
                  4. Data Storage and Security
                </h2>
              </div>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">Where We Store Data:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Servers located in secure data centers (Europe/US)</li>
                    <li>Database: PostgreSQL with encryption at rest</li>
                    <li>Backups: Encrypted daily backups with 7-day retention</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">Security Measures:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>HTTPS encryption for all data transmission</li>
                    <li>Password hashing using bcrypt</li>
                    <li>Rate limiting to prevent abuse</li>
                    <li>Regular security audits and monitoring</li>
                    <li>Access controls and authentication</li>
                  </ul>
                </div>

                <p className="mt-4 font-semibold text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                  <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  Important: No security system is 100% secure. We cannot guarantee absolute security of your data.
                </p>
              </div>
            </motion.section>

            {/* Data Sharing */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                5. How We Share Your Information
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">We do NOT sell your personal data. We may share data with:</p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">5.1 Service Providers</h3>
                  <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                    <li><strong className="text-violet-600 dark:text-fuchsia-400">Paddle:</strong> Payment processing (Merchant of Record)</li>
                    <li><strong className="text-violet-600 dark:text-fuchsia-400">Sentry:</strong> Error tracking and monitoring</li>
                    <li><strong className="text-violet-600 dark:text-fuchsia-400">Email Service:</strong> Transactional emails (verification, password reset)</li>
                    <li><strong className="text-violet-600 dark:text-fuchsia-400">Cloud Infrastructure:</strong> Hosting and storage providers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">5.2 Legal Requirements</h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    We may disclose your information if required by law, court order, or government request,
                    or to protect our rights, property, or safety.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Blockchain Data */}
            <motion.section variants={fadeInUp} className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-2xl p-8 border-l-4 border-amber-500 shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-amber-900 dark:text-amber-200">
                  6. Blockchain and Wallet Data
                </h2>
              </div>
              <div className="space-y-3 text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-amber-900 dark:text-amber-200">Important Notice:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>When you provide a wallet address for DeFi audit, we query <strong>public blockchain data</strong></li>
                  <li>Blockchain data is <strong>publicly accessible</strong> by anyone</li>
                  <li>We store wallet addresses and transaction data to provide the audit service</li>
                  <li>This data may include transaction amounts, timestamps, and protocol interactions</li>
                  <li>You can delete your audit data anytime from your account</li>
                </ul>
              </div>
            </motion.section>

            {/* Your Rights */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                7. Your Privacy Rights
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">You have the right to:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-violet-600 dark:text-fuchsia-400">Access:</strong> Request a copy of your personal data
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-violet-600 dark:text-fuchsia-400">Correction:</strong> Update or correct inaccurate data
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-violet-600 dark:text-fuchsia-400">Deletion:</strong> Request deletion of your account and data
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-violet-600 dark:text-fuchsia-400">Export:</strong> Download your simulation and audit data
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-violet-600 dark:text-fuchsia-400">Opt-out:</strong> Unsubscribe from marketing emails (we send very few)
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-violet-600 dark:text-fuchsia-400">Portability:</strong> Receive your data in a machine-readable format
                  </div>
                </li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 mt-6 leading-relaxed">
                To exercise these rights, contact us at <strong className="text-violet-600 dark:text-fuchsia-400">contact@cryptonomadhub.io</strong>
              </p>
            </motion.section>

            {/* Data Retention */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                8. Data Retention
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">We retain your data for as long as your account is active, plus:</p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Account Data:</strong> Until you delete your account + 30 days</li>
                <li><strong>Simulation History:</strong> Until you delete or close account</li>
                <li><strong>Payment Records:</strong> 7 years (legal requirement)</li>
                <li><strong>Log Data:</strong> 90 days</li>
                <li><strong>Backups:</strong> 7 days rolling retention</li>
              </ul>
            </motion.section>

            {/* Cookies */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                9. Cookies and Tracking
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">We use cookies for:</p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong className="text-violet-600 dark:text-fuchsia-400">Essential Cookies:</strong> Authentication, session management (required)</li>
                <li><strong className="text-violet-600 dark:text-fuchsia-400">Analytics Cookies:</strong> Understanding usage patterns (can be disabled)</li>
                <li><strong className="text-violet-600 dark:text-fuchsia-400">Preference Cookies:</strong> Remembering your settings</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 mt-4 leading-relaxed">
                You can control cookies through your browser settings. Disabling essential cookies may affect functionality.
              </p>
            </motion.section>

            {/* Third-Party Links */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                10. Third-Party Links
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                The Service may contain links to third-party websites (e.g., Paddle payment page, government tax authority sites).
                We are not responsible for the privacy practices of these sites. We encourage you to read their privacy policies.
              </p>
            </motion.section>

            {/* Children's Privacy */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                11. Children's Privacy
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                The Service is not intended for users under 18 years of age. We do not knowingly collect data from children.
                If we discover we have collected data from a child, we will delete it immediately.
              </p>
            </motion.section>

            {/* International Users */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <Globe className="w-6 h-6 text-violet-600 dark:text-fuchsia-400 flex-shrink-0" />
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  12. International Data Transfers
                </h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Your data may be transferred to and stored in countries other than your own.
                These countries may have different data protection laws. By using the Service, you consent to such transfers.
              </p>
            </motion.section>

            {/* GDPR */}
            <motion.section variants={fadeInUp} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-8 border-l-4 border-blue-500 shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-200">
                  13. GDPR Compliance (EU Users)
                </h2>
              </div>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">If you are in the European Union, you have additional rights under GDPR:</p>
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
                <p className="mt-4 font-semibold text-blue-900 dark:text-blue-200">
                  Legal Basis for Processing: Contract performance, legal obligations, and legitimate interests
                </p>
              </div>
            </motion.section>

            {/* Changes to Privacy Policy */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                14. Changes to This Privacy Policy
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by updating the
                "Last updated" date and, for significant changes, by email or prominent notice on the Service.
              </p>
            </motion.section>

            {/* Contact */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <Mail className="w-6 h-6 text-violet-600 dark:text-fuchsia-400 flex-shrink-0" />
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  15. Contact Us
                </h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                If you have questions about this Privacy Policy or want to exercise your privacy rights, contact us at:
              </p>
              <div className="space-y-2 text-slate-700 dark:text-slate-300">
                <p><strong className="text-violet-600 dark:text-fuchsia-400">Email:</strong> contact@cryptonomadhub.io</p>
                <p><strong className="text-violet-600 dark:text-fuchsia-400">Data Protection Officer:</strong> contact@cryptonomadhub.io</p>
                <p className="mt-4">
                  <strong className="text-violet-600 dark:text-fuchsia-400">Address:</strong><br />
                  CryptoNomadHub<br />
                  [Your Company Address]<br />
                  Seychelles
                </p>
              </div>
            </motion.section>

            {/* Summary Box */}
            <motion.section variants={fadeInUp} className="bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-2xl p-8 border-2 border-violet-300 dark:border-violet-700 shadow-xl">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Privacy in Summary
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>We collect only what's necessary to provide the Service</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>We do NOT sell your data to third parties</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Your data is encrypted and securely stored</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>You can delete your account and data anytime</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>We comply with GDPR and data protection laws</span>
                </li>
              </ul>
            </motion.section>
          </motion.div>
        </div>
      </PublicPageSSR>
  )
}
