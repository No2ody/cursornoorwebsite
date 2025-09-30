'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AccessibilityUtils, VisuallyHidden } from '@/lib/accessibility'
import { ImageOptimizer } from '@/lib/image-optimization'

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  stock: number
  category: {
    name: string
  }
  averageRating?: number
  reviewCount?: number
  isInWishlist?: boolean
}

interface EnhancedProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
  onToggleWishlist?: (productId: string) => void
  onQuickView?: (productId: string) => void
  priority?: boolean
  sizes?: string
}

export function EnhancedProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: EnhancedProductCardProps) {
  const [imageError, setImageError] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  
  // Generate unique IDs for accessibility
  const titleId = AccessibilityUtils.generateId('product-title')
  const priceId = AccessibilityUtils.generateId('product-price')
  const ratingId = AccessibilityUtils.generateId('product-rating')
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price)
  }
  
  const handleAddToCart = async () => {
    if (!onAddToCart || product.stock === 0) return
    
    setIsLoading(true)
    try {
      await onAddToCart(product.id)
      // Announce success to screen readers
      AccessibilityUtils.announce(`${product.name} added to cart`, 'polite')
    } catch {
      AccessibilityUtils.announce('Failed to add item to cart', 'assertive')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleToggleWishlist = async () => {
    if (!onToggleWishlist) return
    
    try {
      await onToggleWishlist(product.id)
      const action = product.isInWishlist ? 'removed from' : 'added to'
      AccessibilityUtils.announce(`${product.name} ${action} wishlist`, 'polite')
    } catch {
      AccessibilityUtils.announce('Failed to update wishlist', 'assertive')
    }
  }
  
  const handleQuickView = () => {
    if (!onQuickView) return
    onQuickView(product.id)
  }
  
  // Create optimized image props
  const imageProps = ImageOptimizer.createImageProps(
    product.images[0] || '/images/placeholder-product.jpg',
    `${product.name} - ${product.category.name}`,
    {
      priority,
      sizes,
      width: 300,
      height: 300
    }
  )
  
  const isOutOfStock = product.stock === 0
  const hasDiscount = false // You can implement discount logic here
  
  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg focus-within:shadow-lg"
      role="article"
      aria-labelledby={titleId}
      aria-describedby={`${priceId} ${ratingId}`}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link 
          href={`/products/${product.id}`}
          className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          aria-label={`View details for ${product.name}`}
        >
          {!imageError ? (
            <Image
              {...imageProps}
              alt={imageProps.alt}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
              <span className="text-sm">Image not available</span>
            </div>
          )}
        </Link>
        
        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isOutOfStock && (
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          )}
          {hasDiscount && (
            <Badge variant="secondary" className="bg-red-500 text-white text-xs">
              Sale
            </Badge>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {onToggleWishlist && (
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={handleToggleWishlist}
              aria-label={product.isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            >
              <Heart 
                className={`h-4 w-4 ${product.isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </Button>
          )}
          
          {onQuickView && (
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={handleQuickView}
              aria-label={`Quick view ${product.name}`}
            >
              <Eye className="h-4 w-4 text-gray-600" />
            </Button>
          )}
        </div>
        
        {/* Quick Add to Cart - appears on hover */}
        {onAddToCart && !isOutOfStock && (
          <div className="absolute bottom-2 left-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              size="sm"
              className="w-full bg-brand hover:bg-brand-700 text-white"
              onClick={handleAddToCart}
              disabled={isLoading}
              aria-label={`Add ${product.name} to cart`}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      
      {/* Product Information */}
      <CardContent className="p-4">
        {/* Category */}
        <div className="mb-1">
          <Badge variant="outline" className="text-xs text-gray-600">
            {product.category.name}
          </Badge>
        </div>
        
        {/* Product Name */}
        <h3 
          id={titleId}
          className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-brand transition-colors"
        >
          <Link 
            href={`/products/${product.id}`}
            className="focus:outline-none focus-visible:underline"
          >
            {product.name}
          </Link>
        </h3>
        
        {/* Rating */}
        {product.averageRating && product.reviewCount && (
          <div 
            id={ratingId}
            className="mb-2 flex items-center gap-1"
            role="img"
            aria-label={`${product.averageRating} out of 5 stars, ${product.reviewCount} reviews`}
          >
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.floor(product.averageRating!)
                      ? 'fill-yellow-400 text-yellow-400'
                      : star <= product.averageRating!
                      ? 'fill-yellow-400/50 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              ({product.reviewCount})
            </span>
            <VisuallyHidden>
              {product.averageRating} out of 5 stars, based on {product.reviewCount} reviews
            </VisuallyHidden>
          </div>
        )}
        
        {/* Price */}
        <div id={priceId} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-brand">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price * 1.2)} {/* Example original price */}
              </span>
            )}
          </div>
          
          {/* Stock Status */}
          <div className="text-xs text-gray-600">
            {isOutOfStock ? (
              <span className="text-red-600 font-medium">Out of Stock</span>
            ) : product.stock < 5 ? (
              <span className="text-orange-600 font-medium">
                Only {product.stock} left
              </span>
            ) : (
              <span className="text-green-600">In Stock</span>
            )}
          </div>
        </div>
        
        {/* Mobile Add to Cart Button */}
        {onAddToCart && !isOutOfStock && (
          <div className="mt-3 block sm:hidden">
            <Button
              size="sm"
              className="w-full bg-brand hover:bg-brand-700 text-white"
              onClick={handleAddToCart}
              disabled={isLoading}
              aria-label={`Add ${product.name} to cart`}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
