'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppHeader } from '@/components/AppHeader'
import { CreditCard, ArrowRight, ExternalLink, Check, Info, MapPin, Shield } from 'lucide-react'

interface CryptoCard {
  name: string
  logo: string
  tagline: string
  features: string[]
  bonus: string
  affiliateLink: string
  affiliateBonus: string
  supported_countries: string
  fees: string
  supported_crypto: string[]
  kyc_required: boolean
  cardImage?: string
  cardImages?: string[]
}

interface ResidencyService {
  name: string
  logo: string
  tagline: string
  country: string
  features: string[]
  benefits: string[]
  pricing: string
  processingTime: string
  affiliateLink: string
  affiliateBonus: string
  idealFor: string[]
}

const cryptoCards: CryptoCard[] = [
  {
    name: 'RedotPay',
    logo: '💳',
    tagline: 'Stablecoin-powered global payment platform',
    features: [
      '5M+ users worldwide with $2B payment volume',
      'Virtual & physical Mastercard',
      'Stablecoin-based payments (USDT, USDC)',
      'P2P Marketplace for crypto trading',
      'Earn program with crypto yields',
      'Credit using crypto as collateral',
      'Crypto Swap integrated',
      'Global Payout capabilities',
      'Apple Pay & Google Pay support',
      'Partners: Binance, Circle, Polygon, Solana',
      '4/5 rating on Trustpilot',
    ],
    bonus: 'Join 5M+ users - Special signup bonus available',
    affiliateLink: 'https://url.hk/i/en/14vas',
    affiliateBonus: 'You get: Signup bonus | We earn: Referral commission',
    supported_countries: 'Global coverage (check local restrictions)',
    fees: 'Competitive fees (check website for current rates)',
    supported_crypto: ['USDT', 'USDC', 'BTC', 'ETH', 'SOL'],
    kyc_required: true,
    cardImage: 'https://staticsource1.redotpay.com/web/img/home/v3/card-physical.webp',
    cardImages: [
      'https://staticsource1.redotpay.com/web/img/home/v3/card-physical.webp',
      'https://staticsource1.redotpay.com/web/img/home/v3/card-virtual.webp',
    ],
  },
  {
    name: 'Kast',
    logo: '🎯',
    tagline: 'Global USD accounts with crypto rewards',
    features: [
      'Accepted at 150M+ merchants and ATMs worldwide',
      'Available in 167 countries (including US, Brazil, UAE, Japan)',
      '4 card tiers: Standard (Free), Premium ($1k/year), Limited ($5k), Luxe ($10k/year)',
      'Earn 3-10% rewards on card spend (tier-dependent)',
      'Stablecoin-powered banking (USDC, USDT)',
      'Support for SOL, ETH, BTC, USDC, USDT',
      'Instant virtual card access',
      'Themed cards: Solana Card, Bitcoin Card, K Card',
      'KAST points on staked SOL (0.5x to 2x)',
      'VIP Concierge access (Premium+ tiers)',
      'No traditional bank bureaucracy',
      '📱 Mobile app available (iOS/Android)',
    ],
    bonus: 'Earn up to 10% rewards in 2025',
    affiliateLink: 'https://www.kast.xyz',
    affiliateBonus: 'You get: High rewards tier | We earn: Referral commission',
    supported_countries: '167 countries worldwide',
    fees: 'Free (Standard) to $10k/year (Luxe)',
    supported_crypto: ['USDC', 'USDT', 'SOL', 'ETH', 'BTC'],
    kyc_required: true,
    cardImage: 'https://cdn.prod.website-files.com/660c048ecf246f8d15a85d0a/687e25222224cbfa18ce4933_k-card-core.webp',
    cardImages: [
      'https://cdn.prod.website-files.com/660c048ecf246f8d15a85d0a/687e25222224cbfa18ce4933_k-card-core.webp',
      'https://cdn.prod.website-files.com/660c048ecf246f8d15a85d0a/687e25228c4ffaf64a44273c_solana-card-core.webp',
      'https://cdn.prod.website-files.com/660c048ecf246f8d15a85d0a/687e252269ce0fb805b3e4b5_btc-card.webp',
      'https://cdn.prod.website-files.com/660c048ecf246f8d15a85d0a/687e5334d5169f3f67a3a83e_x-card-premium.webp',
    ],
  },
  {
    name: 'Ultimo',
    logo: '👑',
    tagline: 'Offshore banking with crypto-backed spending',
    features: [
      'Platinum Visa card accepted at 40M+ merchants',
      'Offshore bank account included',
      'ATM withdrawals worldwide',
      'Convert BTC & USDT to USD instantly',
      'UltimoLoan: Borrow against crypto without selling',
      'Support for BTC, USDT (ERC20/TRC20/BEP20), ETH, USDC',
      'Same-day loading: 4% fee or 72h wait for 3% fee',
      'Card usage fee: 0.75%',
      'Immediate transfers: 1% or 72h free',
      'Withdrawal: 0.1% + 0.001 BTC',
    ],
    bonus: 'Offshore banking solution included',
    affiliateLink: 'https://ultimopay.io/?rid=661d543e582fc',
    affiliateBonus: 'You get: Bank account access | We earn: Partnership commission',
    supported_countries: 'Global (offshore banking)',
    fees: '$450 issuance + $150 deposit, $50/year maintenance, $10 renewal/4 years',
    supported_crypto: ['BTC', 'USDT', 'ETH', 'USDC'],
    kyc_required: true,
    cardImage: '/cards/ultimo-card.png',
  },
]

const residencyServices: ResidencyService[] = [
  {
    name: 'Palau Digital Residency',
    logo: '🏝️',
    tagline: 'Official government-backed Web3 identity for global citizens',
    country: 'Republic of Palau',
    features: [
      'Official physical government-issued ID card',
      'On-chain NFT identity (Web3 ID)',
      'Valid for KYC at major crypto exchanges',
      'Use for banking, travel, and identity verification',
      'Accepted at hotels, flights, rentals worldwide',
      '19,189+ digital residencies issued',
      'Available to citizens of 138 countries',
      'Built on Solana blockchain',
      '⚠️ Important: Digital ID only - NOT tax residency or citizenship',
    ],
    benefits: [
      'Global KYC for crypto exchanges (Kraken, Crypto.com)',
      'Enhanced identity verification worldwide',
      'Physical government-issued ID card',
      'Web3-native NFT identity on Solana',
      'Visa extensions up to +180 days per entry',
      'Access to banking services and neobanks',
    ],
    pricing: '$248 one-time application fee',
    processingTime: '2-4 weeks',
    affiliateLink: 'https://rns.id/?rc_by=Oswa5kTT',
    affiliateBonus: 'You get: Official Palau ID | We earn: Referral commission',
    idealFor: [
      'Digital nomads needing global identity verification',
      'Crypto traders requiring KYC for exchanges',
      'Web3 professionals seeking on-chain identity',
      'Remote workers traveling frequently',
    ],
  },
]

export default function ToolsPage() {
  const [selectedCard, setSelectedCard] = useState<CryptoCard | null>(null)

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Crypto Tools & Cards
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              After optimizing your crypto taxes, you'll need the right tools to spend and manage your crypto globally.
            </p>
          </div>
        {/* Affiliate Disclosure */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Transparency & Affiliate Disclosure
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                We may earn a commission when you sign up through our links. This helps us keep CryptoNomadHub free
                and maintain high-quality services. We only recommend products we trust and believe add value to digital nomads.
                You'll also receive exclusive bonuses through our affiliate links!
              </p>
            </div>
          </div>
        </div>

        {/* Crypto Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {cryptoCards.map((card) => (
            <div
              key={card.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white relative overflow-hidden">
                {card.cardImage ? (
                  <div className="absolute inset-0 opacity-20">
                    <img
                      src={card.cardImage}
                      alt={`${card.name} card`}
                      className="w-full h-full object-cover blur-sm"
                    />
                  </div>
                ) : null}
                <div className="relative z-10">
                  {card.cardImage ? (
                    <div className="mb-4 flex justify-center">
                      <img
                        src={card.cardImage}
                        alt={`${card.name} card`}
                        className="h-32 w-auto object-contain drop-shadow-2xl"
                      />
                    </div>
                  ) : (
                    <div className="text-4xl mb-3">{card.logo}</div>
                  )}
                  <h2 className="text-2xl font-bold mb-2">{card.name}</h2>
                  <p className="text-blue-100">{card.tagline}</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    {card.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {card.features.length > 5 && (
                    <button
                      onClick={() => setSelectedCard(card)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
                    >
                      + {card.features.length - 5} more features
                    </button>
                  )}
                </div>

                {/* Bonus Section */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                    🎁 {card.bonus}
                  </p>
                </div>

                {/* Affiliate Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {card.affiliateBonus}
                  </p>
                  {card.name === 'Kast' && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      💡 Download via our app link to get rewards
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                {card.name === 'Kast' ? (
                  <div className="space-y-2">
                    <a
                      href="https://www.kast.xyz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                    >
                      Visit Website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href="https://go.kast.xyz/VqVO/DIKW8Q25"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-semibold text-sm"
                    >
                      📱 Download App (Referral)
                    </a>
                  </div>
                ) : (
                  <a
                    href={card.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                  >
                    Get {card.name}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {/* Details Link */}
                <button
                  onClick={() => setSelectedCard(card)}
                  className="w-full mt-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  View full details →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Digital Residency Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-8 h-8 text-emerald-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Digital Residency & Tax Solutions
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Official government-backed residencies for digital nomads and crypto professionals
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {residencyServices.map((service) => (
              <div
                key={service.name}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Service Header */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-5xl">{service.logo}</div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                        <Shield className="w-4 h-4" />
                        Official
                      </span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{service.name}</h2>
                  <p className="text-emerald-100">{service.tagline}</p>
                  <p className="text-sm text-emerald-200 mt-2">📍 {service.country}</p>
                </div>

                {/* Service Body */}
                <div className="p-6">
                  {/* Pricing & Processing */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-1">
                        Pricing
                      </p>
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                        {service.pricing}
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                        Processing Time
                      </p>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                        {service.processingTime}
                      </p>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-600" />
                      Key Benefits
                    </h3>
                    <ul className="space-y-2">
                      {service.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ideal For */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Ideal For
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {service.idealFor.map((audience, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                        >
                          {audience}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Affiliate Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {service.affiliateBonus}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <a
                    href={service.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold"
                  >
                    Apply for {service.name}
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Additional Info */}
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    <p>
                      ℹ️ This is an official government program. Processing times may vary.
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Coming Soon Card */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🌍</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  More Residencies Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We're adding Estonia e-Residency, Portugal NHR, and more digital residency programs
                </p>
                <Link
                  href="/dashboard"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  Request a residency program →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-12">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Quick Comparison
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Feature
                  </th>
                  {cryptoCards.map((card) => (
                    <th
                      key={card.name}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {card.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    Coverage
                  </td>
                  {cryptoCards.map((card) => (
                    <td key={card.name} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {card.supported_countries}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    Fees
                  </td>
                  {cryptoCards.map((card) => (
                    <td key={card.name} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {card.fees}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    KYC Required
                  </td>
                  {cryptoCards.map((card) => (
                    <td key={card.name} className="px-6 py-4 text-sm">
                      {card.kyc_required ? (
                        <span className="text-orange-600">Yes</span>
                      ) : (
                        <span className="text-green-600">No</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">More Tools Coming Soon!</h2>
          <p className="mb-6">
            We're adding crypto exchanges, VPN services, banking solutions, and more tools for digital nomads.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Back to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  {selectedCard.cardImages && selectedCard.cardImages.length > 0 ? (
                    <div className="mb-4">
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {selectedCard.cardImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`${selectedCard.name} card ${idx + 1}`}
                            className="h-28 w-auto object-contain rounded-lg shadow-lg"
                          />
                        ))}
                      </div>
                    </div>
                  ) : selectedCard.cardImage ? (
                    <div className="mb-4 flex justify-center">
                      <img
                        src={selectedCard.cardImage}
                        alt={`${selectedCard.name} card`}
                        className="h-32 w-auto object-contain rounded-lg shadow-lg"
                      />
                    </div>
                  ) : (
                    <div className="text-4xl mb-2">{selectedCard.logo}</div>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCard.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedCard.tagline}</p>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-4"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    All Features
                  </h3>
                  <ul className="space-y-2">
                    {selectedCard.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Supported Cryptocurrencies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.supported_crypto.map((crypto) => (
                      <span
                        key={crypto}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                      >
                        {crypto}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                    Important Information
                  </h3>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                    <li>• KYC/Identity verification required</li>
                    <li>• Check your country's eligibility before signing up</li>
                    <li>• Fees and features may vary by region</li>
                    <li>• Not financial advice - do your own research</li>
                  </ul>
                </div>

                {selectedCard.name === 'Kast' ? (
                  <div className="space-y-3">
                    <a
                      href="https://www.kast.xyz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                    >
                      Visit Kast Website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href="https://go.kast.xyz/VqVO/DIKW8Q25"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition font-semibold"
                    >
                      📱 Download App (Referral Link)
                    </a>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      Use the app link to support us and get signup bonuses
                    </p>
                  </div>
                ) : (
                  <a
                    href={selectedCard.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                  >
                    Get {selectedCard.name}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
