'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Banner {
  id: string
  title: string
  description?: string
  imageUrl: string
  linkUrl?: string
  linkText?: string
  position: string
  displayOrder: number
}

interface BannerDisplayProps {
  position: 'SECONDARY' | 'SIDEBAR' | 'FOOTER'
  limit?: number
  className?: string
  dismissible?: boolean
  compact?: boolean
}

export function BannerDisplay({
  position,
  limit = 3,
  className,
  dismissible = false,
  compact = false
}: BannerDisplayProps) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/banners?position=${position}&limit=${limit}`)
        
        if (response.ok) {
          const data = await response.json()
          setBanners(data.banners || [])
        }
      } catch (error) {
        console.error('Error fetching banners:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [position, limit])

  // Track banner click
  const trackClick = async (bannerId: string) => {
    try {
      await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerId })
      })
    } catch (error) {
      console.error('Error tracking banner click:', error)
    }
  }

  // Handle banner click
  const handleBannerClick = (banner: Banner) => {
    trackClick(banner.id)
    
    if (banner.linkUrl) {
      if (banner.linkUrl.startsWith('http')) {
        window.open(banner.linkUrl, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = banner.linkUrl
      }
    }
  }

  // Handle banner dismiss
  const handleDismiss = (bannerId: string) => {
    setDismissedBanners(prev => new Set([...prev, bannerId]))
  }

  // Filter out dismissed banners
  const visibleBanners = banners.filter(banner => !dismissedBanners.has(banner.id))

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: Math.min(limit, 2) }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className={cn(
              'bg-gray-200 rounded-lg',
              compact ? 'h-24' : 'h-32'
            )} />
          </div>
        ))}
      </div>
    )
  }

  if (visibleBanners.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-4', className)}>
      {visibleBanners.map((banner) => (
        <div
          key={banner.id}
          className={cn(
            'relative group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300',
            compact ? 'h-24' : 'h-32',
            banner.linkUrl ? 'cursor-pointer' : ''
          )}
          onClick={() => banner.linkUrl && handleBannerClick(banner)}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center p-4">
            <div className="text-white flex-1">
              <h3 className={cn(
                'font-semibold mb-1',
                compact ? 'text-sm' : 'text-base'
              )}>
                {banner.title}
              </h3>
              
              {!compact && banner.description && (
                <p className="text-xs opacity-90 line-clamp-2">
                  {banner.description}
                </p>
              )}
              
              {banner.linkUrl && banner.linkText && (
                <div className="mt-2">
                  <span className={cn(
                    'inline-flex items-center text-xs font-medium text-brand-200 hover:text-white transition-colors',
                    compact ? 'text-xs' : 'text-sm'
                  )}>
                    {banner.linkText}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </span>
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            {dismissible && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 w-6 h-6 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDismiss(banner.id)
                }}
                aria-label="Dismiss banner"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
