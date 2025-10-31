'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { PublicPageLayout } from '@/components/PublicPageLayout'
import { ArrowLeft, AlertTriangle, ShieldAlert, Info, FileText } from 'lucide-react'

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

export default function TermsOfService() {
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
                <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
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
                1. Agreement to Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                By accessing or using CryptoNomadHub ("Service"), you agree to be bound by these Terms of Service ("Terms").
                If you disagree with any part of the terms, you may not access the Service.
              </p>
            </motion.section>

            {/* Description of Service */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                2. Description of Service
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                CryptoNomadHub provides:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Tax simulation tools for cryptocurrency taxation across multiple countries</li>
                <li>DeFi transaction auditing and tax categorization</li>
                <li>AI-powered tax assistance and guidance</li>
                <li>PDF report generation</li>
                <li>Access to tax regulation data for 167 countries</li>
              </ul>
            </motion.section>

            {/* Important Disclaimers */}
            <motion.section variants={fadeInUp} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-8 border-l-4 border-amber-500 shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-amber-900 dark:text-amber-200">
                  3. Important Disclaimers
                </h2>
              </div>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">NOT FINANCIAL OR LEGAL ADVICE:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The Service provides <strong>general information only</strong> and is NOT financial, legal, or tax advice</li>
                    <li>Results may contain errors, inaccuracies, or be outdated</li>
                    <li>Tax laws change frequently and vary by jurisdiction</li>
                    <li>You MUST consult with licensed tax professionals, accountants, and lawyers before making any decisions</li>
                    <li>We are NOT responsible for any losses, penalties, or legal issues arising from use of our Service</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">NO GUARANTEES:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We make no guarantees about accuracy, completeness, or reliability of information</li>
                    <li>Tax regulations displayed may be outdated or incorrect</li>
                    <li>AI responses may be inaccurate or misleading</li>
                    <li>DeFi audit results may miss transactions or miscategorize tax treatment</li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* User Accounts */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                4. User Accounts
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                When you create an account with us, you must:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Not share your account with others</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Be at least 18 years of age</li>
              </ul>
            </motion.section>

            {/* Subscription and Payments */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                5. Subscription and Payments
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p><strong className="text-violet-600 dark:text-fuchsia-400">Free Tier:</strong> Limited features with usage quotas</p>
                <p><strong className="text-violet-600 dark:text-fuchsia-400">Paid Tiers:</strong> STARTER ($15/month or $144/year), PRO ($39/month or $374/year), ENTERPRISE (custom pricing)</p>

                <div>
                  <p className="font-semibold mb-2">Payment terms:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Payments are processed securely via Paddle (our Merchant of Record)</li>
                    <li>Subscriptions renew automatically unless cancelled</li>
                    <li>You can cancel anytime from your account settings</li>
                    <li>We reserve the right to change pricing with 30 days notice</li>
                    <li>Cryptocurrency payments (BTC, ETH, USDT) may be available for annual plans</li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* Usage Limits */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                6. Usage Limits and Fair Use
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                Each subscription tier has monthly usage limits:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>FREE:</strong> 3 simulations, 2 DeFi audits, 10 chat messages, 1 wallet</li>
                <li><strong>STARTER:</strong> 50 simulations, 15 DeFi audits, 100 chat messages, 3 wallets, 1k cost basis tx/year</li>
                <li><strong>PRO:</strong> Unlimited simulations, 100 DeFi audits, 500 chat messages, 15 wallets, 50k cost basis tx/year</li>
                <li><strong>ENTERPRISE:</strong> Unlimited with fair use policy</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 mt-4 leading-relaxed">
                We reserve the right to suspend accounts that abuse the service or exceed fair use limits.
              </p>
            </motion.section>

            {/* Refund Policy */}
            <motion.section variants={fadeInUp} className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-8 border-l-4 border-emerald-500 shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <h2 className="text-2xl font-semibold text-emerald-900 dark:text-emerald-200">
                  7. Refund Policy
                </h2>
              </div>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">14-Day Money-Back Guarantee:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>If you are not satisfied with your purchase, you may request a full refund within <strong>14 days</strong> of your initial subscription payment</li>
                  <li>To request a refund, contact us at <strong className="text-violet-600 dark:text-fuchsia-400">contact@cryptonomadhub.io</strong> with your account email and subscription details</li>
                  <li>Refunds are processed within 5-10 business days via Paddle (our payment processor)</li>
                  <li>After the 14-day period, subscriptions are non-refundable</li>
                </ul>

                <p className="font-semibold text-emerald-900 dark:text-emerald-200 mt-4">No Partial Month Refunds:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>If you cancel your subscription after the 14-day refund period, you will NOT receive a prorated refund for the unused portion of your billing period</li>
                  <li>Your subscription will remain active until the end of the current billing cycle</li>
                  <li>You can continue using all paid features until your subscription expires</li>
                </ul>

                <p className="font-semibold text-emerald-900 dark:text-emerald-200 mt-4">Annual Subscriptions:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Annual subscriptions are eligible for the 14-day money-back guarantee</li>
                  <li>After 14 days, annual subscriptions are non-refundable even if cancelled mid-year</li>
                  <li>You will retain access until the end of your annual billing period</li>
                </ul>

                <p className="font-semibold text-emerald-900 dark:text-emerald-200 mt-4">Refund Exceptions:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We reserve the right to refuse refunds for accounts that violate our Terms of Service</li>
                  <li>Accounts that abuse the refund policy (e.g., repeated subscriptions and cancellations) may be banned</li>
                  <li>Cryptocurrency payments may have different refund terms due to blockchain irreversibility</li>
                </ul>

                <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-emerald-200 dark:border-emerald-900">
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 mb-2">Contact for Refunds:</p>
                  <p className="text-sm">Email: <a href="mailto:contact@cryptonomadhub.io" className="text-violet-600 dark:text-fuchsia-400 hover:underline">contact@cryptonomadhub.io</a></p>
                  <p className="text-sm mt-1">Include: Your account email, subscription details, and reason for refund request</p>
                </div>
              </div>
            </motion.section>

            {/* Prohibited Uses */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                8. Prohibited Uses
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">You may NOT:</p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Attempt to hack, reverse engineer, or compromise the Service</li>
                <li>Scrape, data mine, or extract data in bulk</li>
                <li>Use the Service to provide tax advice to others commercially</li>
                <li>Share your account credentials or subscription with others</li>
                <li>Upload malicious code or attempt DDoS attacks</li>
                <li>Impersonate others or provide false information</li>
              </ul>
            </motion.section>

            {/* Intellectual Property */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                9. Intellectual Property
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                The Service and its original content, features, and functionality are owned by CryptoNomadHub and are
                protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </motion.section>

            {/* Data Privacy */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                10. Data and Privacy
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Your use of the Service is also governed by our <Link href="/privacy" className="text-violet-600 dark:text-fuchsia-400 hover:underline font-semibold">Privacy Policy</Link>.
                We collect and use data as described in that policy.
              </p>
            </motion.section>

            {/* Termination */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                11. Termination
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                We may terminate or suspend your account and access immediately, without prior notice or liability,
                for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
              </p>
            </motion.section>

            {/* User Responsibilities */}
            <motion.section variants={fadeInUp} className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-2xl p-8 border-l-4 border-orange-500 shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-orange-900 dark:text-orange-200">
                  12. Your Responsibilities
                </h2>
              </div>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-orange-900 dark:text-orange-200">YOU ARE SOLELY RESPONSIBLE FOR:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your tax compliance in all relevant jurisdictions</li>
                  <li>Verifying all information provided by the Service with qualified professionals</li>
                  <li>Filing accurate and timely tax returns</li>
                  <li>Maintaining records of all cryptocurrency transactions</li>
                  <li>Understanding and complying with the tax laws of your jurisdiction(s)</li>
                  <li>Any consequences arising from your use or misuse of the Service</li>
                </ul>
                <p className="mt-4">
                  <strong className="text-orange-900 dark:text-orange-200">You acknowledge that:</strong> The Service provides estimations and general information only.
                  You must independently verify all tax calculations and seek professional advice before making any tax filings or financial decisions.
                </p>
              </div>
            </motion.section>

            {/* Indemnification */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                13. Indemnification
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                You agree to defend, indemnify, and hold harmless CryptoNomadHub, its owners, employees, contractors, and
                affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Your use or misuse of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Tax penalties, audits, or legal issues related to your tax filings</li>
                <li>Any inaccurate information you provide</li>
                <li>Your reliance on Service outputs without professional verification</li>
              </ul>
            </motion.section>

            {/* Limitation of Liability */}
            <motion.section variants={fadeInUp} className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-2xl p-8 border-l-4 border-red-500 shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-red-900 dark:text-red-200">
                  14. Limitation of Liability
                </h2>
              </div>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-red-900 dark:text-red-200">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>CryptoNomadHub shall NOT be liable for any indirect, incidental, special, consequential, or punitive damages</li>
                  <li>We are NOT liable for tax penalties, audits, legal issues, fines, or financial losses resulting from use of the Service</li>
                  <li>We are NOT liable for errors in blockchain data, transaction categorization, or tax calculations</li>
                  <li>We are NOT liable for outdated or incorrect tax regulations displayed in the Service</li>
                  <li>Our total liability shall not exceed the lesser of: (a) $100 USD, or (b) the amount paid by you in the past 12 months</li>
                  <li>The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, express or implied</li>
                  <li>We make NO WARRANTY that the Service will be error-free, accurate, or uninterrupted</li>
                </ul>
              </div>
            </motion.section>

            {/* Blockchain Data Disclaimer */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                15. Blockchain Data and DeFi Audit Disclaimer
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">Regarding DeFi audits and on-chain transaction analysis:</p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Blockchain data may be incomplete, incorrect, or fail to capture all transactions</li>
                <li>Transaction categorization is automated and may be incorrect</li>
                <li>Some protocols, DEXs, or chains may not be supported or may have incomplete data</li>
                <li>Smart contract interactions may be misinterpreted</li>
                <li>You MUST manually verify all transactions and their tax treatment</li>
                <li>We are NOT responsible for missed transactions or incorrect categorization</li>
              </ul>
            </motion.section>

            {/* Remaining sections with similar styling */}
            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                16. Governing Law and Dispute Resolution
              </h2>
              <div className="text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
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
            </motion.section>

            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                17. Severability
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be
                limited or eliminated to the minimum extent necessary so that the remaining Terms remain in full force and effect.
              </p>
            </motion.section>

            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                18. Changes to Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by
                updating the "Last updated" date and, for registered users, by email. Your continued use of the Service
                after changes constitutes acceptance of the new Terms. If you do not agree to the modified Terms,
                you must stop using the Service.
              </p>
            </motion.section>

            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                19. Entire Agreement
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                These Terms, together with our Privacy Policy and any other legal notices published by us on the Service,
                constitute the entire agreement between you and CryptoNomadHub concerning the Service.
              </p>
            </motion.section>

            <motion.section variants={fadeInUp} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                20. Contact Us
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                If you have questions about these Terms, please contact us at:<br />
                <strong className="text-violet-600 dark:text-fuchsia-400">contact@cryptonomadhub.io</strong>
              </p>
            </motion.section>

            {/* Acceptance */}
            <motion.section variants={fadeInUp} className="bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-2xl p-8 border-2 border-violet-300 dark:border-violet-700 shadow-xl">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Acceptance of Terms
              </h3>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">
                  By creating an account, clicking "I Accept", or by using the Service, you acknowledge and agree that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You have read and understood these Terms of Service in their entirety</li>
                  <li>You have read and understood our Privacy Policy</li>
                  <li>You understand this Service is NOT financial, tax, or legal advice</li>
                  <li>You are solely responsible for your tax compliance and will verify all information with licensed professionals</li>
                  <li>You agree to indemnify and hold harmless CryptoNomadHub from any claims or damages</li>
                  <li>You accept all limitations of liability and disclaimers stated herein</li>
                </ul>
                <p className="mt-6 font-bold text-lg text-violet-700 dark:text-fuchsia-400">
                  IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THE SERVICE.
                </p>
              </div>
            </motion.section>
          </motion.div>
        </div>
    </PublicPageLayout>
  )
}
