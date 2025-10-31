'use client'

import Link from 'next/link'
import { ArrowRight, BarChart3, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MultiCountryCompareClient() {
  return (
    <>
      <section className="relative bg-gradient-to-b from-purple-50 via-fuchsia-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-fuchsia-900/30 text-purple-700 dark:text-fuchsia-300 text-sm font-bold mb-6">
              <BarChart3 className="w-4 h-4" />
              UNIQUE FEATURE
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">Multi-Country Compare</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600">
                2-5 Countries Side-by-Side
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              The only platform that lets you compare multiple countries simultaneously. See tax calculations, effective rates, and savings estimates all at once.
            </p>
            <Link href="/simulations/new" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
              Try Comparison Tool
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Compare 2-5 Countries', description: 'Select multiple destinations and see them all side-by-side with identical calculations.' },
              { title: 'Automatic Ranking', description: 'Countries ranked by savings. See best options instantly.' },
              { title: 'Detailed Breakdown', description: 'Tax calculations, effective rates, short/long-term breakdown for each country.' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <CheckCircle className="w-8 h-8 text-purple-600 dark:text-fuchsia-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
