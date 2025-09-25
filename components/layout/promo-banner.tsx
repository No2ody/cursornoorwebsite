'use client'

import { useState, useEffect } from 'react'
import { X, Phone, Truck, Award } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const promos = [
  {
    id: 'free-shipping',
    icon: Truck,
    text: 'Free shipping on orders over AED 500',
    cta: 'Shop Now',
    href: '/products',
    color: 'from-brand to-brand-700'
  },
  {
    id: 'consultation',
    icon: Phone,
    text: 'Free consultation for lighting design projects',
    cta: 'Call Now',
    href: '/contact',
    color: 'from-gold to-gold-700'
  },
  {
    id: 'warranty',
    icon: Award,
    text: '2-year warranty on all LED lighting products',
    cta: 'Learn More',
    href: '/about',
    color: 'from-green-600 to-green-700'
  }
]

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentPromo = promos[currentIndex]

  // Auto-rotate promos every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gradient-to-r text-white transition-all duration-300 ease-in-out',
        currentPromo.color
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3 flex-1">
            <currentPromo.icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{currentPromo.text}</span>
            <Link
              href={currentPromo.href}
              className="hidden sm:inline-flex items-center text-sm font-semibold hover:underline ml-2"
            >
              {currentPromo.cta} →
            </Link>
          </div>

          {/* Promo Indicators */}
          <div className="hidden md:flex items-center gap-2 mx-4">
            {promos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-200',
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                )}
                aria-label={`Show promo ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-black/20 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
    </div>
  )
}