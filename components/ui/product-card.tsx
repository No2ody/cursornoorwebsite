'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/store/use-cart'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { WishlistButton } from '@/components/shared/wishlist-button'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    images: string[]
    categoryId: string
    stock?: number
    reviews?: {
      rating: number
    }[]
  }
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const cart = useCart()
  const { toast } = useToast()
  
  const averageRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        product.reviews.length
      : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking the button
    cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    })

    toast({
      title: 'Added to cart',
      description: `${product.name} added to your cart`,
      action: (
        <ToastAction altText='View cart' asChild>
          <Link href='/cart'>View Cart</Link>
        </ToastAction>
      ),
    })
  }

  const isOutOfStock = product.stock !== undefined && product.stock <= 0

  return (
    <Card className={cn('product-card group relative', className)}>
      {/* Product Badge */}
      {!isOutOfStock && (
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-brand text-white shadow-lg">
            New
          </Badge>
        </div>
      )}
      
      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="destructive" className="shadow-lg">
            Out of Stock
          </Badge>
        </div>
      )}

      {/* Wishlist Button */}
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <WishlistButton product={product} size="icon" variant="ghost" className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg" />
      </div>

      <Link href={`/products/${product.id}`} className="block">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden relative bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="product-image object-cover"
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Eye className="h-5 w-5 text-brand" />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <CardHeader className="p-4 pb-2">
          <CardTitle className="line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-brand transition-colors duration-200">
            {product.name}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm text-gray-600 leading-relaxed">
            {product.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-0 pb-2">
          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({product.reviews?.length || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-brand">
              AED {product.price.toFixed(2)}
            </div>
            {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
              <Badge variant="outline" className="text-warning border-warning">
                Only {product.stock} left
              </Badge>
            )}
          </div>
        </CardContent>
      </Link>

      {/* Action Buttons */}
      <CardFooter className="p-4 pt-2">
        <div className="flex gap-2 w-full">
          <Button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 bg-brand hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>

        {/* Quick View Button - Shows on Hover */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
            onClick={(e) => {
              e.preventDefault()
              // Quick view functionality can be implemented here
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}