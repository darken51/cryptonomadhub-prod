import { memo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { XCircle, AlertCircle, CheckCircle, Info, ArrowRight, X } from 'lucide-react'

interface AlertsSectionProps {
  alerts: any[]
  dismissedAlerts: Set<string>
  onDismiss: (id: string) => void
}

export default memo(function AlertsSection({
  alerts,
  dismissedAlerts,
  onDismiss,
}: AlertsSectionProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="w-5 h-5" />
      case 'warning': return <AlertCircle className="w-5 h-5" />
      case 'success': return <CheckCircle className="w-5 h-5" />
      default: return <Info className="w-5 h-5" />
    }
  }

  const getAlertColors = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-500/10 border-red-500 text-red-300'
      case 'warning': return 'bg-yellow-500/10 border-yellow-500 text-yellow-300'
      case 'success': return 'bg-green-500/10 border-green-500 text-green-300'
      default: return 'bg-blue-500/10 border-blue-500 text-blue-300'
    }
  }

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id))

  if (visibleAlerts.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-12"
    >
      <div className="space-y-3">
        {visibleAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-xl border p-4 ${getAlertColors(alert.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{alert.title}</h4>
                <p className="text-sm opacity-90">{alert.message}</p>
                {alert.action_label && alert.action_url && (
                  <Link
                    href={alert.action_url}
                    className="inline-flex items-center gap-1 mt-2 text-sm font-semibold hover:underline"
                  >
                    {alert.action_label}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
              {alert.dismissible && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="opacity-60 hover:opacity-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
})
