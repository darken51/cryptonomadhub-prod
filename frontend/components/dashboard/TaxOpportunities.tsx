import { memo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingDown, DollarSign, Clock, ArrowRight } from 'lucide-react'

export default memo(function TaxOpportunities({ opportunities }: { opportunities: any[] }) {
  if (!opportunities || opportunities.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-12"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <TrendingDown className="w-8 h-8 text-green-400" />
          Tax Optimization Opportunities
        </h2>
        <Link
          href="/tax-optimizer"
          className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-2"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {opportunities.slice(0, 3).map((opp: any, index: number) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-green-500 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-sm text-slate-400">{opp.token} • {opp.chain}</span>
              </div>
              {opp.deadline && (
                <div className="flex items-center gap-1 text-xs text-orange-400">
                  <Clock className="w-3 h-3" />
                  {new Date(opp.deadline).toLocaleDateString()}
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{opp.title}</h3>
            <p className="text-sm text-slate-400 mb-4">{opp.description}</p>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
              <div className="text-xs text-green-400 mb-1">Potential Savings</div>
              <div className="text-2xl font-bold text-green-300">
                ${opp.potential_savings.toLocaleString()}
              </div>
            </div>

            <div className="text-xs text-slate-500">
              <strong className="text-slate-400">Action:</strong> {opp.recommended_action}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
})
