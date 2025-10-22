import { memo } from 'react'
import { motion } from 'framer-motion'
import { Clock, Search, Calculator, MessageCircle, FileText, TrendingDown, Info } from 'lucide-react'

export default memo(function RecentActivities({ activities }: { activities: any[] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'defi_audit': return <Search className="w-4 h-4" />
      case 'simulation': return <Calculator className="w-4 h-4" />
      case 'chat': return <MessageCircle className="w-4 h-4" />
      case 'cost_basis': return <FileText className="w-4 h-4" />
      case 'tax_opportunity': return <TrendingDown className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  if (!activities || activities.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-12"
    >
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Clock className="w-8 h-8 text-blue-400" />
        Recent Activity
      </h2>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-700">
          {activities.slice(0, 5).map((activity: any) => (
            <div key={activity.id} className="p-4 hover:bg-slate-800/80 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-400 flex-shrink-0">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white">{activity.title}</h4>
                  {activity.subtitle && (
                    <p className="text-sm text-slate-400 mt-1">{activity.subtitle}</p>
                  )}
                  {activity.metadata && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(activity.metadata).map(([key, value]: [string, any]) => (
                        <span
                          key={key}
                          className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-500 flex-shrink-0">
                  {new Date(activity.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
})
