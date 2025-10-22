'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle, Brain, Sparkles, CheckCircle, Zap, Shield } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'

export default function AIChatFeaturePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "AI Chat Assistant - Portfolio Analysis",
            "description": "Advanced AI chat assistant that analyzes your crypto portfolio data directly. Get personalized tax recommendations based on your actual positions and transactions.",
            "url": "https://cryptonomadhub.com/features/ai-chat"
          })
        }}
      />
      <Header />

      <section className="relative bg-gradient-to-b from-cyan-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 dark:bg-blue-900/30 text-cyan-700 dark:text-blue-300 text-sm font-bold mb-6">
              <Brain className="w-4 h-4" />
              AI-POWERED INSIGHTS
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">AI Chat Assistant</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">
                Analyzes Your Portfolio
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Advanced AI that understands your crypto positions and gives personalized tax recommendations based on your actual data.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/chat" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
                Start Chatting
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: 'Portfolio-Aware', description: 'AI sees your wallets, transactions, and holdings to give context-specific advice.' },
              { icon: Sparkles, title: 'Personalized Recommendations', description: 'Suggestions based on YOUR data, not generic advice. Country recommendations tailored to your situation.' },
              { icon: Shield, title: 'Context Memory', description: 'Remembers past conversations. No need to repeat yourself. Builds on previous discussions.' }
            ].map((feature, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-cyan-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Try the AI Chat Assistant</h2>
          <p className="text-xl text-white/90 mb-8">Start a conversation and get personalized tax insights</p>
          <Link href="/chat" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-cyan-600 bg-white hover:bg-slate-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
            <MessageCircle className="w-5 h-5 mr-2" />
            Start Chatting
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
