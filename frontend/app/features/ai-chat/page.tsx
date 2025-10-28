'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle, Brain, Sparkles, CheckCircle, Zap, Shield, Globe, FileText, TrendingUp, History, Lightbulb, Calculator } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'
import { motion } from 'framer-motion'

export default function AIChatFeaturePage() {
  const features = [
    {
      icon: Brain,
      title: 'Context-Aware Intelligence',
      description: 'AI remembers your portfolio, wallets, and past conversations. No need to repeat yourself - it builds on previous discussions for deeper insights.'
    },
    {
      icon: Globe,
      title: 'Multi-Country Expertise',
      description: 'Ask about tax regulations in any of 167 countries. Get instant comparisons between jurisdictions tailored to your situation.'
    },
    {
      icon: Calculator,
      title: 'Simulation Recommendations',
      description: 'AI suggests tax simulations based on your questions. Seamlessly transition from chat to detailed tax calculations.'
    },
    {
      icon: History,
      title: 'Conversation History',
      description: 'Access all your past conversations. Pick up where you left off. Search through previous insights and recommendations.'
    },
    {
      icon: Lightbulb,
      title: 'Smart Suggestions',
      description: 'Get contextual follow-up questions and suggestions. Discover tax optimization strategies you didn\'t know to ask about.'
    },
    {
      icon: FileText,
      title: 'Direct Tool Links',
      description: 'AI provides direct links to relevant tools (cost basis, DeFi audit, tax optimizer) when you need them.'
    }
  ]

  const exampleQuestions = [
    { question: 'Which countries have 0% crypto tax?', category: 'Country Research' },
    { question: 'Compare tax between UAE and Portugal', category: 'Comparisons' },
    { question: 'How does Germany tax staking rewards?', category: 'Specific Rules' },
    { question: 'Best countries for crypto traders?', category: 'Recommendations' },
    { question: 'Do I need to report airdrops?', category: 'Tax Compliance' },
    { question: 'What is the 183-day rule?', category: 'Tax Residency' }
  ]

  const useCases = [
    {
      title: 'Digital Nomad Planning',
      description: 'Ask about tax residency rules, visa requirements, and optimal country sequences for perpetual travelers.',
      icon: Globe
    },
    {
      title: 'Tax Optimization',
      description: 'Get personalized strategies to minimize your crypto tax burden legally across multiple jurisdictions.',
      icon: TrendingUp
    },
    {
      title: 'Compliance Guidance',
      description: 'Understand reporting requirements, deadlines, and documentation needed for your specific situation.',
      icon: Shield
    }
  ]

  return (
    <PublicPageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "AI Chat Assistant - Crypto Tax Expert",
            "description": "Advanced AI chat assistant specialized in crypto tax regulations across 167 countries. Get instant answers, country comparisons, and personalized tax optimization strategies.",
            "url": "https://cryptonomadhub.io/features/ai-chat"
          })
        }}
      />
      <section className="relative bg-gradient-to-b from-cyan-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 dark:bg-blue-900/30 text-cyan-700 dark:text-blue-300 text-sm font-bold mb-6">
              <Brain className="w-4 h-4" />
              AI-POWERED TAX EXPERT
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">AI Chat Assistant</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">
                Your Crypto Tax Expert
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Ask anything about crypto taxes in 167 countries. Get instant answers, country comparisons, and personalized optimization strategies from our AI trained on global tax regulations.
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

      {/* Core Features */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Intelligent Features
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              More than just a chatbot - an AI tax expert that understands your context and provides actionable insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow"
              >
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

      {/* Example Questions */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ask Anything
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Here are some examples of what you can ask. The AI handles complex tax questions across all 167 countries.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exampleQuestions.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-cyan-400 dark:hover:border-blue-500 transition-colors cursor-pointer group"
              >
                <span className="text-xs font-semibold text-cyan-600 dark:text-blue-400 mb-2 block">
                  {item.category}
                </span>
                <p className="text-slate-900 dark:text-white font-medium group-hover:text-cyan-600 dark:group-hover:text-blue-400 transition-colors">
                  "{item.question}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Perfect For
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Whether you're planning your next move or optimizing your current situation, the AI adapts to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-2xl p-8 border border-cyan-200 dark:border-blue-800"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6">
                  <useCase.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{useCase.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How It Works
            </h2>
          </div>

          <div className="space-y-8">
            {[
              { step: '1', title: 'Ask Your Question', description: 'Type any question about crypto taxes, country regulations, or tax optimization strategies.' },
              { step: '2', title: 'AI Analyzes Context', description: 'The AI considers your conversation history, portfolio data (if connected), and the latest tax regulations from 167 countries.' },
              { step: '3', title: 'Get Personalized Answer', description: 'Receive detailed, context-aware responses with country comparisons, tax calculations, and direct links to relevant tools.' },
              { step: '4', title: 'Take Action', description: 'Follow AI suggestions to run simulations, connect wallets, or explore specific countries - all seamlessly integrated.' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Chatting with Your AI Tax Expert
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Get instant answers to your crypto tax questions. Free plan includes 10 messages/month.
          </p>
          <Link href="/chat" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-cyan-600 bg-white hover:bg-slate-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
            <MessageCircle className="w-5 h-5 mr-2" />
            Launch Chat Assistant
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <p className="text-white/70 text-sm mt-6">
            ⚠️ AI provides general information only, not financial or tax advice. Consult professionals for your specific situation.
          </p>
        </div>
      </section>
    </PublicPageLayout>
  )
}
