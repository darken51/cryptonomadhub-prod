'use client'

import Link from 'next/link'
import { ArrowRight, Calculator } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function CostBasisPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />
      <section className="relative bg-gradient-to-b from-sky-50 via-cyan-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="text-slate-900 dark:text-white">Cost Basis Tracking</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600">FIFO/LIFO/HIFO + Wash Sale</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Track cost basis with FIFO, LIFO, HIFO methods. Automatic wash sale detection (30-day rule) and IRS Form 8949 export.
          </p>
          <Link href="/cost-basis" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-sky-600 to-cyan-600 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
            Start Tracking
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}
