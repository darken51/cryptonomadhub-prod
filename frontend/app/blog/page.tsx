'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, FileText, Clock, Tag, TrendingUp, Globe, DollarSign, Shield, Calendar } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'
import { motion } from 'framer-motion'

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Posts')

  const blogPosts = [
    {
      title: 'Portugal Crypto Tax 2025: What Digital Nomads Need to Know',
      excerpt: 'Portugal has proposed changes to its 0% crypto tax policy. Here\'s what it means for digital nomads and how to prepare for the upcoming changes.',
      category: 'Tax News',
      date: '2025-10-19',
      readTime: '8 min read',
      gradient: 'from-blue-500 to-cyan-600',
      icon: Globe,
      href: '/blog/portugal-crypto-tax-2025'
    },
    {
      title: 'UAE vs Singapore: Comparing 0% Crypto Tax Destinations',
      excerpt: 'Both offer 0% crypto tax, but which country is better for your situation? We compare cost of living, visa requirements, and quality of life.',
      category: 'Country Comparison',
      date: '2025-10-05',
      readTime: '12 min read',
      gradient: 'from-emerald-500 to-teal-600',
      icon: TrendingUp,
      href: '/blog/uae-vs-singapore-comparison'
    },
    {
      title: 'Tax Loss Harvesting: Ultimate Guide for Crypto Traders',
      excerpt: 'Learn how to offset capital gains with strategic losses. Complete guide to tax loss harvesting with real examples and IRS rules.',
      category: 'Tax Strategy',
      date: '2025-09-20',
      readTime: '15 min read',
      gradient: 'from-amber-500 to-orange-600',
      icon: DollarSign,
      href: '/blog/tax-loss-harvesting-guide'
    },
    {
      title: 'Solana DeFi Taxes: Jupiter, Raydium, Orca Explained',
      excerpt: 'How to report Solana DeFi transactions for taxes. Complete guide covering Jupiter swaps, Raydium LP, Orca liquidity, and Marinade staking.',
      category: 'DeFi Guide',
      date: '2025-09-05',
      readTime: '10 min read',
      gradient: 'from-violet-500 to-purple-600',
      icon: Shield,
      href: '/blog/solana-defi-taxes-explained'
    },
    {
      title: 'The 183-Day Rule: Avoiding Accidental Tax Residency',
      excerpt: 'Perpetual travelers beware: spending 183+ days in a country can trigger tax residency. Here\'s how to track and avoid it.',
      category: 'Tax Planning',
      date: '2025-08-20',
      readTime: '7 min read',
      gradient: 'from-rose-500 to-pink-600',
      icon: Globe,
      href: '/blog/183-day-rule-tax-residency'
    },
    {
      title: 'Germany Crypto Tax Changes 2025: 26% to 42%?',
      excerpt: 'New proposals could increase crypto tax rates in Germany. What this means for traders and how to optimize before changes take effect.',
      category: 'Tax News',
      date: '2025-08-05',
      readTime: '6 min read',
      gradient: 'from-indigo-500 to-blue-600',
      icon: TrendingUp,
      href: '/blog/germany-crypto-tax-changes-2025'
    },
    {
      title: 'FIFO vs LIFO vs HIFO: Which Saves the Most Tax?',
      excerpt: 'Deep dive into cost basis methods. Real examples showing how choosing the right method can save thousands in crypto taxes.',
      category: 'Tax Strategy',
      date: '2025-07-20',
      readTime: '14 min read',
      gradient: 'from-cyan-500 to-blue-600',
      icon: DollarSign,
      href: '/blog/fifo-lifo-hifo-comparison'
    },
    {
      title: 'Best Crypto-Friendly Countries for 2025',
      excerpt: 'Our AI analyzed 167 countries. Here are the top 10 destinations for crypto holders based on tax rates, regulations, and quality of life.',
      category: 'Rankings',
      date: '2025-07-05',
      readTime: '11 min read',
      gradient: 'from-emerald-500 to-teal-600',
      icon: Globe,
      href: '/blog/best-crypto-countries-2025'
    },
    {
      title: 'Wash Sale Rule for Crypto: What You Need to Know',
      excerpt: 'Understanding the 30-day wash sale rule. How it applies to crypto, common mistakes, and strategies to avoid violations.',
      category: 'Tax Strategy',
      date: '2025-06-20',
      readTime: '9 min read',
      gradient: 'from-rose-500 to-pink-600',
      icon: Shield,
      href: '/blog/wash-sale-rule-crypto'
    },
    {
      title: 'US Citizens Abroad: Crypto Tax Obligations Explained',
      excerpt: 'US citizenship-based taxation applies to crypto worldwide. FBAR, FATCA, and how to stay compliant while living abroad.',
      category: 'Tax Planning',
      date: '2025-06-05',
      readTime: '13 min read',
      gradient: 'from-amber-500 to-orange-600',
      icon: DollarSign,
      href: '/blog/us-citizens-abroad-crypto-tax'
    },
    {
      title: 'NFT Taxes: Complete Guide for Creators and Traders',
      excerpt: 'How to report NFT sales, royalties, and minting costs. Cost basis tracking for NFT collections and IRS reporting requirements.',
      category: 'DeFi Guide',
      date: '2025-05-20',
      readTime: '10 min read',
      gradient: 'from-violet-500 to-purple-600',
      icon: TrendingUp,
      href: '/blog/nft-taxes-guide'
    },
    {
      title: 'Cyprus 0% Crypto Tax: The EU\'s Hidden Gem',
      excerpt: 'Cyprus offers 0% long-term crypto gains tax within the EU. Requirements, residency process, and comparison to other EU countries.',
      category: 'Country Spotlight',
      date: '2024-11-05',
      readTime: '8 min read',
      gradient: 'from-blue-500 to-cyan-600',
      icon: Globe,
      href: '/blog/cyprus-crypto-tax-eu'
    }
  ]

  const categories = [
    'All Posts',
    'Tax News',
    'Tax Strategy',
    'Country Comparison',
    'DeFi Guide',
    'Tax Planning'
  ]

  const filteredPosts = selectedCategory === 'All Posts'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory)

  return (
    <PublicPageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "CryptoNomadHub Blog",
            "description": "Crypto tax strategies, country comparisons, DeFi guides, and tax news for digital nomads and crypto traders. Expert insights on optimizing taxes across 167 countries.",
            "url": "https://cryptonomadhub.io/blog"
          })
        }}
      />
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-violet-50 via-purple-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-12 pb-24 md:pt-20 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-purple-900/30 text-violet-700 dark:text-purple-300 text-sm font-bold mb-6">
              <FileText className="w-4 h-4" />
              BLOG & INSIGHTS
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">Crypto Tax</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600">
                Insights & Strategies
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Expert guides on crypto taxation, country comparisons, DeFi strategies, and tax news from around the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40 backdrop-blur-lg bg-white/80 dark:bg-slate-950/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-violet-600 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <span className="text-sm font-semibold text-violet-600 dark:text-purple-400 uppercase tracking-wider">Featured Post</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                Tax News
              </span>
              <span className="flex items-center gap-2 text-sm text-white/80">
                <Calendar className="w-4 h-4" />
                January 15, 2025
              </span>
              <span className="flex items-center gap-2 text-sm text-white/80">
                <Clock className="w-4 h-4" />
                8 min read
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Portugal Crypto Tax 2025: What Digital Nomads Need to Know
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl">
              Portugal has proposed changes to its 0% crypto tax policy. Here's what it means for digital nomads currently living in Portugal or considering relocation, and how to prepare for the upcoming changes.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-600 rounded-xl font-semibold hover:bg-white/90 transition-all transform hover:scale-105">
              Read Full Article
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, idx) => (
              <Link key={idx} href={post.href}>
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all cursor-pointer h-full"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${post.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <post.icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-violet-100 dark:bg-purple-900/30 text-violet-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                      {post.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-purple-400 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </span>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Never Miss a Tax Update
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Get weekly crypto tax insights, country updates, and optimization strategies delivered to your inbox.
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-6 py-4 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/60 transition-all"
              />
              <button className="px-6 py-4 bg-white text-violet-600 rounded-xl font-semibold hover:bg-white/90 transition-all transform hover:scale-105 whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-white/70 text-sm mt-4">
              No spam. Unsubscribe anytime. 15,000+ subscribers.
            </p>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  )
}
