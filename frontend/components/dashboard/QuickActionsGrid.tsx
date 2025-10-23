/**
 * Quick Actions Grid - Memoized for performance
 * 9 action cards with optimized animations
 */

import { memo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calculator, Globe, Search, MessageCircle, TrendingDown,
  FileText, CreditCard, Wallet, Settings, ArrowRight, Sparkles, GitCompare
} from 'lucide-react'

const actions = [
  {
    href: '/simulations/new',
    Icon: Calculator,
    title: 'New Simulation',
    description: 'Compare 2 countries and calculate savings',
    gradient: 'from-violet-600 to-purple-700',
    label: 'Start'
  },
  {
    href: '/countries',
    Icon: Globe,
    title: 'Explore 160 Countries',
    description: 'Discover crypto tax data by country',
    gradient: 'from-blue-600 to-cyan-700',
    label: 'Explore'
  },
  {
    href: '/simulations/compare',
    Icon: GitCompare,
    title: 'Compare Countries',
    description: 'Side-by-side tax comparison (2-5 countries)',
    gradient: 'from-purple-600 to-violet-700',
    label: 'Compare'
  },
  {
    href: '/defi-audit',
    Icon: Search,
    title: 'DeFi Audit',
    description: 'Analyze your crypto transactions',
    gradient: 'from-green-600 to-emerald-700',
    label: 'Start'
  },
  {
    href: '/chat',
    Icon: MessageCircle,
    title: 'AI Chat',
    description: 'Compare tax data from 160 countries',
    gradient: 'from-pink-600 to-rose-700',
    label: 'Chat'
  },
  {
    href: '/tax-optimizer',
    Icon: TrendingDown,
    title: 'Tax Analysis',
    description: 'Identify opportunities (info only)',
    gradient: 'from-yellow-600 to-amber-700',
    label: 'Analyze'
  },
  {
    href: '/cost-basis',
    Icon: FileText,
    title: 'Cost Basis',
    description: 'Track your cost basis',
    gradient: 'from-indigo-600 to-blue-700',
    label: 'Manage'
  },
  {
    href: '/tools',
    Icon: CreditCard,
    title: 'Crypto Cards & ID',
    description: 'Crypto cards & Digital Residency',
    gradient: 'from-orange-600 to-red-700',
    label: 'Explore'
  },
  {
    href: '/wallets',
    Icon: Wallet,
    title: 'Wallet Portfolio',
    description: 'Track multi-chain holdings & P&L',
    gradient: 'from-teal-600 to-cyan-700',
    label: 'Manage'
  },
  {
    href: '/settings',
    Icon: Settings,
    title: 'Settings',
    description: 'Configure your account',
    gradient: 'from-slate-600 to-gray-700',
    label: 'Configure'
  },
]

export const QuickActionsGrid = memo(function QuickActionsGrid() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-12"
    >
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-yellow-400" />
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <ActionCard key={action.href} {...action} index={index} />
        ))}
      </div>
    </motion.section>
  )
})

// ✅ OPTIMIZATION: Separate card component to prevent unnecessary re-renders
const ActionCard = memo(function ActionCard({
  href,
  Icon,
  title,
  description,
  gradient,
  label,
  index,
}: {
  href: string
  Icon: any
  title: string
  description: string
  gradient: string
  label: string
  index: number
}) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }} // Stagger animation
        whileHover={{ scale: 1.02 }} // Reduced from 1.05
        whileTap={{ scale: 0.98 }} // Reduced from 0.95
        className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-xl cursor-pointer group`}
      >
        <Icon className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-white/80">{description}</p>
        <div className="mt-4 flex items-center gap-2 text-white font-semibold">
          {label}
          <ArrowRight className="w-4 h-4" />
        </div>
      </motion.div>
    </Link>
  )
})
