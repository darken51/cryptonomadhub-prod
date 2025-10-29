'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, CheckCircle2, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react'
import QRCode from 'react-qr-code'

interface CryptoPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  planName: string
  tier: 'starter' | 'pro'
  period: 'monthly' | 'annual'
  amount: number
}

interface PaymentData {
  payment_id: number
  pay_address: string
  pay_amount: string
  pay_currency: string
  price_amount: number
  price_currency: string
  expiration_estimate_date: string
  payment_url: string
}

const SUPPORTED_CRYPTOS = [
  { id: 'btc', name: 'Bitcoin', icon: '₿' },
  { id: 'eth', name: 'Ethereum', icon: 'Ξ' },
  { id: 'usdttrc20', name: 'USDT (TRC20)', icon: '₮' },
  { id: 'ltc', name: 'Litecoin', icon: 'Ł' },
]

export function CryptoPaymentModal({ isOpen, onClose, planName, tier, period, amount }: CryptoPaymentModalProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCrypto(null)
      setPaymentData(null)
      setError(null)
      setCopied(false)
    }
  }, [isOpen])

  // Poll payment status
  useEffect(() => {
    if (!paymentData) return

    const interval = setInterval(async () => {
      try {
        setCheckingStatus(true)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nowpayments/payment-status/${paymentData.payment_id}`, {
          credentials: 'include',
        })

        if (res.ok) {
          const data = await res.json()

          if (data.payment_status === 'finished') {
            // Payment successful!
            window.location.href = '/dashboard?payment=success'
          } else if (data.payment_status === 'expired' || data.payment_status === 'failed') {
            setError('Payment expired or failed. Please try again.')
            clearInterval(interval)
          }
        }
      } catch (err) {
        console.error('Error checking payment status:', err)
      } finally {
        setCheckingStatus(false)
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [paymentData])

  const handleCryptoSelect = async (crypto: string) => {
    setSelectedCrypto(crypto)
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nowpayments/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tier,
          period,
          crypto
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || 'Failed to create payment')
      }

      const data = await res.json()
      setPaymentData(data)
    } catch (err: any) {
      setError(err.message || 'Failed to create payment. Please try again.')
      setSelectedCrypto(null)
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    if (paymentData) {
      navigator.clipboard.writeText(paymentData.pay_address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Pay with Crypto</h2>
                    <p className="text-white/80 text-sm mt-1">{planName} - ${amount}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Error */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
                  </div>
                )}

                {/* Step 1: Select Crypto */}
                {!paymentData && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                      Select Cryptocurrency
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {SUPPORTED_CRYPTOS.map((crypto) => (
                        <button
                          key={crypto.id}
                          onClick={() => handleCryptoSelect(crypto.id)}
                          disabled={loading}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            selectedCrypto === crypto.id
                              ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{crypto.icon}</div>
                            <div className="text-left">
                              <div className="font-semibold text-slate-900 dark:text-white">{crypto.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{crypto.id.toUpperCase()}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {loading && (
                      <div className="mt-6 flex items-center justify-center gap-3 text-slate-600 dark:text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating payment...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Payment Details */}
                {paymentData && (
                  <div className="space-y-6">
                    {/* Payment status */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Loader2 className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-spin flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800 dark:text-amber-200">
                          <div className="font-semibold">Waiting for payment...</div>
                          <div className="mt-1">
                            Send <strong>{paymentData.pay_amount} {paymentData.pay_currency.toUpperCase()}</strong> to the address below.
                            {checkingStatus && <span className="ml-2 text-xs">(checking...)</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                        <QRCode
                          value={paymentData.pay_address}
                          size={200}
                          bgColor="#ffffff"
                          fgColor="#000000"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-900 dark:text-white">
                        Payment Address
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={paymentData.pay_address}
                          readOnly
                          className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-mono text-sm text-slate-900 dark:text-white"
                        />
                        <button
                          onClick={copyAddress}
                          className="p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                        >
                          {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      {copied && (
                        <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                          ✓ Address copied to clipboard
                        </div>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-900 dark:text-white">
                          Amount to Send
                        </label>
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {paymentData.pay_amount}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {paymentData.pay_currency.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-900 dark:text-white">
                          Equivalent to
                        </label>
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            ${paymentData.price_amount}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {paymentData.price_currency}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                        <p className="font-semibold">⚠️ Important:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Send the <strong>exact amount</strong> shown above</li>
                          <li>Payment will be confirmed after blockchain confirmations</li>
                          <li>Your subscription will activate automatically after confirmation</li>
                          <li>This address expires in 24 hours</li>
                        </ul>
                      </div>
                    </div>

                    {/* View on NOWPayments */}
                    {paymentData.payment_url && (
                      <a
                        href={paymentData.payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-900 dark:text-white"
                      >
                        <span>View payment on NOWPayments</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
