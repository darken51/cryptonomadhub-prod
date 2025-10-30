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

// Crypto icon components
const CryptoIcon = ({ id }: { id: string }) => {
  const icons: Record<string, JSX.Element> = {
    btc: (
      <svg viewBox="0 0 32 32" className="w-8 h-8">
        <circle cx="16" cy="16" r="16" fill="#F7931A"/>
        <path d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z" fill="white"/>
      </svg>
    ),
    eth: (
      <svg viewBox="0 0 32 32" className="w-8 h-8">
        <circle cx="16" cy="16" r="16" fill="#627EEA"/>
        <path d="M16.498 4v8.87l7.497 3.35z" fill="white" fillOpacity=".602"/>
        <path d="M16.498 4L9 16.22l7.498-3.35z" fill="white"/>
        <path d="M16.498 21.968v6.027L24 17.616z" fill="white" fillOpacity=".602"/>
        <path d="M16.498 27.995v-6.028L9 17.616z" fill="white"/>
        <path d="M16.498 20.573l7.497-4.353-7.497-3.348z" fill="white" fillOpacity=".2"/>
        <path d="M9 16.22l7.498 4.353v-7.701z" fill="white" fillOpacity=".602"/>
      </svg>
    ),
    usdttrc20: (
      <svg viewBox="0 0 32 32" className="w-8 h-8">
        <circle cx="16" cy="16" r="16" fill="#26A17B"/>
        <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117" fill="white"/>
      </svg>
    ),
    usdterc20: (
      <svg viewBox="0 0 32 32" className="w-8 h-8">
        <circle cx="16" cy="16" r="16" fill="#26A17B"/>
        <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117" fill="white"/>
      </svg>
    ),
    usdc: (
      <svg viewBox="0 0 32 32" className="w-8 h-8">
        <circle cx="16" cy="16" r="16" fill="#2775CA"/>
        <path d="M20.022 18.124c0-2.124-1.28-2.852-3.84-3.156-1.828-.243-2.193-.728-2.193-1.578 0-.85.61-1.396 1.828-1.396 1.097 0 1.707.364 2.011 1.275a.458.458 0 00.427.303h.975a.416.416 0 00.427-.425v-.06a3.04 3.04 0 00-2.743-2.489V9.142c0-.243-.183-.425-.487-.486h-.915c-.243 0-.426.182-.487.486v1.396c-1.829.242-2.986 1.456-2.986 2.974 0 2.002 1.218 2.791 3.778 3.095 1.707.303 2.255.668 2.255 1.639 0 .97-.853 1.638-2.011 1.638-1.585 0-2.133-.667-2.316-1.578-.06-.242-.244-.364-.427-.364h-1.036a.416.416 0 00-.426.425v.06c.243 1.518 1.219 2.61 3.23 2.914v1.457c0 .242.183.425.487.485h.915c.243 0 .426-.182.487-.485V21.34c1.829-.303 3.047-1.578 3.047-3.217z" fill="white"/>
        <path d="M12.252 24.502c-2.316-1.092-3.957-3.398-3.957-6.056 0-3.764 3.047-6.813 6.813-6.813 2.658 0 4.996 1.519 6.088 3.835a7.585 7.585 0 002.133-5.338c0-4.237-3.412-7.65-7.65-7.65-4.237 0-7.649 3.413-7.649 7.65 0 2.658 1.097 5.034 2.864 6.752C8.354 18.368 7.5 21 7.5 21l2.68-.427c.243.85.611 1.638 1.097 2.367l-.304 1.943c.182.06.365.121.547.182l.73-2.563zm1.55 4.237l-.425-.182-.304-1.882c-.182-.121-.365-.243-.547-.425l-2.011.365-.182-.425 1.096-2.195a9.775 9.775 0 01-.547-.607L9 23.813l-.243-.364 1.828-1.578c-.122-.182-.243-.425-.365-.607l-2.194.242-.122-.425 1.822-1.518a7.583 7.583 0 01-.304-.668l-2.011.365-.121-.486 2.011-.607a10.19 10.19 0 01-.182-.668L7.5 17.5l.06-.486 2.011.121c0-.243.06-.486.122-.79l-1.883-.424.06-.486 1.883.242c.06-.243.121-.486.243-.729l-1.396-1.032.183-.425 1.639.85c.121-.243.303-.486.485-.79l-.972-1.518.304-.364 1.217 1.275c.182-.182.425-.425.668-.607L12.252 10.5l.364-.243 1.157 1.457c.243-.182.486-.304.79-.486l.425-1.822.486.06-.243 1.883c.243-.06.486-.06.729-.121l.607-2.011.486.06-.546 2.011c.243 0 .486.06.729.06l.668-1.821.486.121-.668 1.821c.243.061.486.182.729.243l.972-1.579.425.183-.85 1.518c.243.12.486.303.729.546l1.518-.97.304.425-1.397 1.092c.182.182.365.425.546.668l1.883-1.275.243.364-1.822 1.214c.121.243.243.546.365.85l2.316-.607.122.424-2.195.547c.06.242.121.485.182.668l2.56-1.092.06.486-2.438.85c0 .243.06.486.06.668l2.56-.182v.425l-2.56.424c0 .243 0 .486-.06.729l2.56.424v.486l-2.377-.182c-.06.243-.122.486-.183.729l2.011.424-.121.486-2.011-.182a7.19 7.19 0 01-.304.668l1.822.607-.182.486-1.762-.365c-.122.242-.243.485-.365.607l1.518 1.821-.182.425-1.457-1.701c-.182.242-.365.424-.607.607l1.092 2.195-.304.424-1.275-2.073c-.243.182-.486.364-.729.485l.607 2.682-.486.06-.485-2.621c-.243.06-.486.121-.729.121l-.182 2.924h-.486l-.121-2.925c-.243 0-.486-.06-.729-.06l-.486 2.56-.486-.121.607-2.438a5.844 5.844 0 01-.668-.304l-1.275 2.011-.425-.243 1.214-1.822c-.243-.182-.486-.364-.668-.546l-1.64 1.396-.303-.425 1.578-1.335c-.182-.243-.304-.486-.425-.729l-2.194.667-.121-.486 2.011-.485c-.061-.243-.122-.546-.183-.73l-2.682.424-.06-.485 2.56-.183c0-.243 0-.486.06-.729l-2.438-.668.06-.486 2.438.424c.061-.243.122-.486.183-.729l-1.884-1.214.122-.425 1.761 1.032c.122-.242.304-.485.486-.668l-1.092-1.882.243-.364 1.214 1.639c.182-.243.425-.485.668-.668l-.546-2.438.424-.122.668 2.317c.243-.121.485-.243.729-.364l.06-2.742.486-.061.122 2.621c.243-.06.486-.06.729-.121l.424-2.317.486.06-.303 2.255c.243 0 .486.061.729.061l.729-1.822.486.182-.668 1.7c.242.06.485.181.729.242l1.275-1.335.304.425-1.214 1.154c.243.121.486.303.668.485l1.884-1.214.243.364-1.7 1.092c.182.243.365.485.546.729l2.194-.728.183.424-2.073.667c.122.243.243.485.304.728l2.194-.303.122.485-2.317.243c.06.243.06.486.121.729l2.924-.849v.486l-2.803.849c0 .242 0 .485-.06.728l2.925.243v.486l-2.865-.243c-.06.243-.06.486-.121.729l2.621.424-.061.486-2.56-.424c-.06.242-.182.485-.304.668l2.012 1.154-.182.424-2.012-1.153c-.122.242-.243.485-.425.668l1.396 1.7-.304.424-1.396-1.7c-.182.183-.425.366-.668.547l.85 2.317-.425.182-.972-2.256c-.243.122-.486.243-.729.304l.243 2.925h-.486l-.303-2.864c-.243.06-.486.06-.729.121l-.121 2.985h-.546l-.122-3.046c-.242 0-.485-.06-.668-.12l-.485 2.924-.486-.061.546-2.863c-.243-.061-.486-.182-.729-.243l-1.032 2.317-.425-.182 1.032-2.256a4.728 4.728 0 01-.668-.486l-1.518 1.822-.364-.304 1.457-1.761c-.182-.182-.365-.425-.546-.668l-2.134 1.275-.243-.424 2.073-1.275c-.122-.243-.243-.486-.365-.729l-2.499.667-.121-.424 2.438-.546c-.061-.243-.122-.546-.183-.85l-2.86.485-.06-.485 2.803-.485c0-.243 0-.485.06-.729l-2.743-.607v-.485l2.743.424c0-.243.06-.485.121-.729l-2.195-1.092.122-.425 2.133 1.032c.06-.243.182-.485.304-.668l-1.579-1.639.243-.364 1.64 1.518c.12-.243.303-.485.485-.668l-.972-2.195.364-.304.972 2.134c.182-.243.425-.486.668-.668l-.304-2.682.425-.122.425 2.56c.243-.12.485-.241.729-.363l-.243-3.046.485-.06.365 3.107c.243-.06.486-.122.729-.122l.668-2.742.485.06-.546 2.803c.243 0 .486.06.729.06l1.032-2.255.424.183-1.032 2.194c.243.06.486.182.729.243l1.64-1.639.364.304-1.579 1.579c.243.182.486.364.668.607l2.073-1.154.304.425-2.012 1.092c.183.243.304.486.425.729l2.438-.607.182.486-2.438.546c.061.243.183.486.243.729l2.803-.182v.485l-2.803.364c.06.243.06.485.06.668l3.047.06v.486l-2.985-.06c0 .242 0 .485-.06.728l2.924.607-.06.424-2.925-.546c-.06.242-.122.485-.243.728l2.56 1.275-.182.425-2.499-1.214c-.122.242-.304.485-.486.729l1.822 1.7-.243.425-1.822-1.64c-.182.243-.425.486-.668.668l1.154 2.438-.425.183-1.153-2.377a6.233 6.233 0 01-.73.425l.547 2.863-.485.12-.607-2.924c-.243.122-.486.183-.729.243l.06 3.168h-.485z" fill="white"/>
      </svg>
    ),
    ltc: (
      <svg viewBox="0 0 32 32" className="w-8 h-8">
        <circle cx="16" cy="16" r="16" fill="#345D9D"/>
        <path d="M10.427 19.214L9 19.768l.688-2.759 1.444-.58L13.213 8h5.129l-1.519 6.196 1.41-.571-.68 2.75-1.427.571-.848 3.483H23L22.127 24H9.252z" fill="white"/>
      </svg>
    ),
  }

  return icons[id] || <span className="text-3xl">💎</span>
}

const SUPPORTED_CRYPTOS = [
  { id: 'btc', name: 'Bitcoin', network: 'Bitcoin Network', minAmount: 20 },
  { id: 'eth', name: 'Ethereum', network: 'Ethereum Network', minAmount: 20 },
  { id: 'usdttrc20', name: 'USDT', network: 'TRC20 (Tron)', minAmount: 10 },
  { id: 'usdterc20', name: 'USDT', network: 'ERC20 (Ethereum)', minAmount: 10 },
  { id: 'usdc', name: 'USDC', network: 'ERC20 (Ethereum)', minAmount: 10 },
  { id: 'ltc', name: 'Litecoin', network: 'Litecoin Network', minAmount: 20 },
]

export function CryptoPaymentModal({ isOpen, onClose, planName, tier, period, amount }: CryptoPaymentModalProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)

  // Filter cryptos based on payment amount (NOWPayments minimum amounts)
  const availableCryptos = SUPPORTED_CRYPTOS.filter(crypto => amount >= crypto.minAmount)

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
      // Get token from localStorage
      const token = localStorage.getItem('access_token')
      if (!token) {
        setError('Authentication required. Please log in again.')
        setLoading(false)
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nowpayments/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          tier,
          period,
          crypto
        })
      })

      if (!res.ok) {
        let errorMsg = 'Failed to create payment'
        try {
          const errorData = await res.json()
          errorMsg = errorData.detail || errorData.message || errorMsg
        } catch {
          errorMsg = `Server error (${res.status})`
        }
        throw new Error(errorMsg)
      }

      const data = await res.json()
      setPaymentData(data)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create payment. Please try again.'
      console.error('Crypto payment error:', errorMessage)
      setError(String(errorMessage)) // Ensure it's a string
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

                    {amount < 20 && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                        ℹ️ For payments under $20, only stablecoins (USDT, USDC) are available due to minimum amount requirements.
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {availableCryptos.map((crypto) => (
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
                            <CryptoIcon id={crypto.id} />
                            <div className="text-left flex-1">
                              <div className="font-semibold text-slate-900 dark:text-white">{crypto.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{crypto.network}</div>
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
