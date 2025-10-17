'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Testimonial {
  id: number
  name: string
  role: string
  fromCountry: string
  toCountry: string
  savings: string
  quote: string
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Alex Thompson',
    role: 'Crypto Trader',
    fromCountry: '🇺🇸 USA',
    toCountry: '🇵🇹 Portugal',
    savings: '$47,000',
    quote: 'Moving from the US to Portugal saved me nearly $50k in taxes. CryptoNomadHub made the entire process transparent and easy to understand.',
    avatar: 'AT'
  },
  {
    id: 2,
    name: 'Maria Santos',
    role: 'DeFi Investor',
    fromCountry: '🇬🇧 UK',
    toCountry: '🇦🇪 Dubai',
    savings: '$83,000',
    quote: 'The AI assistant helped me discover tax optimization strategies I never knew existed. The DeFi audit feature is a game-changer.',
    avatar: 'MS'
  },
  {
    id: 3,
    name: 'Chen Wei',
    role: 'NFT Collector',
    fromCountry: '🇦🇺 Australia',
    toCountry: '🇸🇬 Singapore',
    savings: '$31,500',
    quote: 'Best investment I made was using CryptoNomadHub. The multi-wallet tracking and cost basis calculator saved me countless hours.',
    avatar: 'CW'
  },
  {
    id: 4,
    name: 'Sophie Dubois',
    role: 'Digital Nomad',
    fromCountry: '🇫🇷 France',
    toCountry: '🇵🇹 Portugal',
    savings: '$25,000',
    quote: 'As a digital nomad, optimizing my crypto taxes was crucial. This platform covers 160+ countries - no other tool comes close.',
    avatar: 'SD'
  }
]

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [])

  const handlePrevious = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="relative">
        {/* Testimonial Card */}
        <div className="relative h-80 md:h-64 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 italic">
                  "{testimonials[currentIndex].quote}"
                </p>

                {/* Author Info */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold">
                      {testimonials[currentIndex].avatar}
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {testimonials[currentIndex].name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {testimonials[currentIndex].role}
                      </p>
                    </div>
                  </div>

                  {/* Migration & Savings */}
                  <div className="text-right">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {testimonials[currentIndex].fromCountry} → {testimonials[currentIndex].toCountry}
                    </div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      Saved {testimonials[currentIndex].savings}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1)
                  setCurrentIndex(index)
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-violet-600 dark:bg-fuchsia-400'
                    : 'w-2 bg-slate-300 dark:bg-slate-600'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  )
}
