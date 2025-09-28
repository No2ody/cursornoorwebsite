'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ZoomIn, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ProductGalleryProps {
  images: string[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  if (!images.length) {
    return (
      <div className='aspect-square w-full bg-gray-100 flex items-center justify-center rounded-2xl card-enhanced'>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <ZoomIn className="h-8 w-8 text-gray-400" />
          </div>
          <span className='text-gray-500 font-medium'>No image available</span>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className='space-y-6'>
      {/* Main Image */}
      <div className='relative group'>
        <div className={cn(
          'aspect-square w-full relative rounded-2xl overflow-hidden card-enhanced cursor-zoom-in transition-transform duration-300',
          isZoomed && 'scale-105'
        )}>
          <Image
            src={images[selectedImage]}
            alt='Product image'
            fill
            className='object-contain p-4 transition-transform duration-300 hover:scale-105'
            priority
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            onClick={() => setIsZoomed(!isZoomed)}
          />
          
          {/* Image Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/80 backdrop-blur-sm hover:bg-white"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-black/50 text-white backdrop-blur-sm">
                {selectedImage + 1} / {images.length}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className='grid grid-cols-4 gap-3'>
          {images.map((image, index) => (
            <button
              key={image}
              className={cn(
                'aspect-square relative rounded-xl overflow-hidden transition-all duration-200 hover:scale-105',
                selectedImage === index 
                  ? 'ring-2 ring-brand shadow-lg' 
                  : 'ring-1 ring-gray-200 hover:ring-brand/50'
              )}
              onClick={() => setSelectedImage(index)}
            >
              <Image
                src={image}
                alt={`Product thumbnail ${index + 1}`}
                fill
                className='object-contain p-2'
                sizes='(max-width: 768px) 25vw, 10vw'
              />
              {selectedImage === index && (
                <div className="absolute inset-0 bg-brand/10" />
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Image Info */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Click image to zoom • Use arrows to navigate
        </p>
      </div>
    </div>
  )
}
