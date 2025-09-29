'use client'

import { useState, useEffect, useCallback } from 'react'
// import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause,
  ExternalLink,
  Eye
} from 'lucide-react'
import Image from 'next/image'
// import Link from 'next/link'
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

interface BannerCarouselProps {
  position?: 'HERO' | 'SECONDARY' | 'SIDEBAR' | 'FOOTER'
  autoPlay?: boolean
  autoPlayInterval?: number
  showControls?: boolean
  showIndicators?: boolean
  className?: string
  aspectRatio?: 'video' | 'banner' | 'square'
}

export function BannerCarousel({
  position = 'HERO',
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  className,
  aspectRatio = 'banner'
}: BannerCarouselProps) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/banners?position=${position}&limit=10`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch banners')
        }
        
        const data = await response.json()
        setBanners(data.banners || [])
        
        if (data.banners?.length === 0) {
          setError('No banners available')
        }
      } catch (err) {
        console.error('Error fetching banners:', err)
        setError('Failed to load banners')
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [position])

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isPlaying, banners.length, autoPlayInterval])

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious()
      } else if (event.key === 'ArrowRight') {
        goToNext()
      } else if (event.key === ' ') {
        event.preventDefault()
        setIsPlaying(!isPlaying)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevious, goToNext, isPlaying])

  // Aspect ratio classes
  const aspectRatioClasses = {
    video: 'aspect-video', // 16:9
    banner: 'aspect-[21/9]', // Wide banner
    square: 'aspect-square'
  }

  if (loading) {
    return (
      <div className={cn('relative overflow-hidden rounded-lg', className)}>
        <div className={cn('animate-pulse bg-gray-200', aspectRatioClasses[aspectRatio])} />
      </div>
    )
  }

  if (error || banners.length === 0) {
    return null // Don't show anything if no banners
  }

  const currentBanner = banners[currentIndex]

  return (
    <div className={cn('relative group overflow-hidden rounded-lg shadow-lg', className)}>
      {/* Main Banner Display */}
      <div className={cn('relative', aspectRatioClasses[aspectRatio])}>
        <Image
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={currentIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          <div className="text-white max-w-2xl">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
              {currentBanner.title}
            </h2>
            
            {currentBanner.description && (
              <p className="text-lg md:text-xl mb-4 md:mb-6 opacity-90">
                {currentBanner.description}
              </p>
            )}
            
            {currentBanner.linkUrl && currentBanner.linkText && (
              <Button
                onClick={() => handleBannerClick(currentBanner)}
                className="bg-brand hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg"
              >
                {currentBanner.linkText}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && banners.length > 1 && (
        <>
          {/* Previous Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={goToPrevious}
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Next Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={goToNext}
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Banner Count Badge */}
      {banners.length > 1 && (
        <Badge 
          variant="secondary" 
          className="absolute top-4 left-4 bg-black/20 text-white border-0"
        >
          <Eye className="w-3 h-3 mr-1" />
          {currentIndex + 1} / {banners.length}
        </Badge>
      )}
    </div>
  )
}
