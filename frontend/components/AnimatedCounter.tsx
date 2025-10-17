'use client'

import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 2000,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = ''
}: AnimatedCounterProps) {
  const countRef = useRef<HTMLSpanElement>(null)
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true
  })

  useEffect(() => {
    if (!inView || !countRef.current) return

    const start = 0
    const end = value
    const startTime = Date.now()
    const endTime = startTime + duration

    const updateCount = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * easeOut

      if (countRef.current) {
        countRef.current.textContent =
          prefix + current.toFixed(decimals) + suffix
      }

      if (now < endTime) {
        requestAnimationFrame(updateCount)
      } else {
        if (countRef.current) {
          countRef.current.textContent = prefix + end.toFixed(decimals) + suffix
        }
      }
    }

    requestAnimationFrame(updateCount)
  }, [inView, value, duration, suffix, prefix, decimals])

  return (
    <span ref={ref} className={className}>
      <span ref={countRef}>
        {prefix}{value.toFixed(decimals)}{suffix}
      </span>
    </span>
  )
}
