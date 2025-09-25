'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
// import Image from 'next/image'
// Removed framer-motion for build compatibility
import { ChevronDown, Lightbulb, Bath, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  description?: string
  image?: string
  href: string
}

interface MegaMenuProps {
  categories: Category[]
  className?: string
}

export function MegaMenu({ categories, className }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Group categories by type for better organization
  const lightingCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes('led') || 
    cat.name.toLowerCase().includes('light') ||
    cat.name.toLowerCase().includes('switch')
  )
  
  const bathroomCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes('bath') || 
    cat.name.toLowerCase().includes('mirror') ||
    cat.name.toLowerCase().includes('cabinet')
  )

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen(true)
        setFocusedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false)
        setFocusedIndex(-1)
        break
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => (prev + 1) % categories.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => prev <= 0 ? categories.length - 1 : prev - 1)
        break
      case 'Tab':
        if (!e.shiftKey && focusedIndex === categories.length - 1) {
          setIsOpen(false)
          setFocusedIndex(-1)
        }
        break
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div 
      className={cn("relative", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        className="flex items-center gap-2 text-lg font-medium text-gray-700 hover:text-brand transition-colors px-4 py-2 rounded-lg hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Categories menu"
      >
        Categories
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Mega Menu Panel */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 mt-2 w-[800px] bg-white rounded-2xl shadow-card border border-gray-100 p-8 z-50 transform transition-all duration-200 ease-out opacity-100 scale-100"
          role="menu"
          aria-label="Product categories"
        >
            <div className="grid grid-cols-3 gap-8">
              {/* Lighting Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-brand" />
                  </div>
                  <h3 className="font-semibold text-ink">LED Lighting</h3>
                </div>
                <div className="space-y-2">
                  {lightingCategories.slice(0, 6).map((category, index) => (
                    <Link
                      key={category.id}
                      href={`/products?category=${category.id}`}
                      className={cn(
                        "block px-3 py-2 text-sm text-gray-700 hover:text-brand hover:bg-brand-50 rounded-lg transition-colors",
                        focusedIndex === index && "bg-brand-50 text-brand"
                      )}
                      role="menuitem"
                      tabIndex={focusedIndex === index ? 0 : -1}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bathroom Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center">
                    <Bath className="w-4 h-4 text-gold-700" />
                  </div>
                  <h3 className="font-semibold text-ink">Bathroom</h3>
                </div>
                <div className="space-y-2">
                  {bathroomCategories.slice(0, 6).map((category, index) => (
                    <Link
                      key={category.id}
                      href={`/products?category=${category.id}`}
                      className={cn(
                        "block px-3 py-2 text-sm text-gray-700 hover:text-brand hover:bg-brand-50 rounded-lg transition-colors",
                        focusedIndex === lightingCategories.length + index && "bg-brand-50 text-brand"
                      )}
                      role="menuitem"
                      tabIndex={focusedIndex === lightingCategories.length + index ? 0 : -1}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Featured/Promo Section */}
              <div>
                <div className="bg-gradient-to-br from-brand to-gold rounded-xl p-6 text-white">
                  <Wrench className="w-8 h-8 mb-3 opacity-90" />
                  <h3 className="font-bold text-lg mb-2">Professional Installation</h3>
                  <p className="text-sm opacity-90 mb-3">
                    Expert installation services for all lighting and bathroom fixtures
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center text-sm font-medium hover:underline"
                  >
                    Get Quote →
                  </Link>
                </div>
                
                <Link
                  href="/products"
                  className="block mt-4 p-4 border border-gray-200 rounded-xl hover:border-brand transition-colors"
                >
                  <h4 className="font-medium text-ink mb-1">View All Products</h4>
                  <p className="text-sm text-gray-600">Browse our complete catalog</p>
                </Link>
              </div>
            </div>
        </div>
      )}
    </div>
  )
}
