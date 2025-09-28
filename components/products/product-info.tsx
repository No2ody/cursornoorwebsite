'use client'

import { useState } from 'react'
import { Star, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCart } from '@/store/use-cart'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { SocialSharing } from './social-sharing'
import Link from 'next/link'

interface ProductInfoProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    stock: number
    images: string[]
    reviews: {
      rating: number
    }[]
  }
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState('1')
  const cart = useCart()
  const { toast } = useToast()

  // Calculate average rating
  const averageRating = product.reviews.length
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
      product.reviews.length
    : 0

  const handleAddToCart = () => {
    cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: parseInt(quantity),
    })

    toast({
      title: 'Added to cart',
      description: `${quantity} x ${product.name} added to your cart`,
      action: (
        <ToastAction altText='View cart' asChild>
          <Link href='/cart'>View Cart</Link>
        </ToastAction>
      ),
    })
  }

  return (
    <div className='space-y-8'>
      {/* Product Title & Rating */}
      <div className="space-y-4">
        <div>
          <h1 className='text-4xl font-bold text-gray-900 display-font leading-tight'>
            {product.name}
          </h1>
          <div className='flex items-center gap-3 mt-3'>
            <div className='flex items-center gap-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= averageRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className='text-gray-600 font-medium'>
              {averageRating.toFixed(1)} ({product.reviews.length} reviews)
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <div className='text-4xl font-bold text-brand display-font'>
            AED {product.price.toFixed(2)}
          </div>
          <div className="text-lg text-gray-500 line-through">
            AED {(product.price * 1.2).toFixed(2)}
          </div>
          <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
            Save 17%
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className='prose prose-lg max-w-none'>
        <p className="text-gray-700 leading-relaxed">{product.description}</p>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {product.stock > 0 ? (
          <>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-700 font-medium">
              In Stock ({product.stock} available)
            </span>
          </>
        ) : (
          <>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-red-700 font-medium">Out of Stock</span>
          </>
        )}
      </div>

      {/* Quantity & Actions */}
      <div className='space-y-6'>
        <div className="card-enhanced p-6">
          <div className="space-y-4">
            <div>
              <label className='text-sm font-medium text-gray-900 mb-3 block'>
                Quantity
              </label>
              <Select value={quantity} onValueChange={setQuantity}>
                <SelectTrigger className='w-32 input-enhanced'>
                  <SelectValue placeholder='Select quantity' />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: Math.min(10, product.stock) }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleAddToCart} 
                className='flex-1 btn-brand text-lg py-6' 
                size='lg'
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-6 py-6 border-2 hover:bg-gray-50"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" size="lg">
            Buy Now
          </Button>
          <Button variant="outline" className="flex-1" size="lg">
            Get Quote
          </Button>
        </div>

        {/* Social Sharing */}
        <div className='flex items-center justify-center pt-4'>
          <SocialSharing product={product} />
        </div>
      </div>
    </div>
  )
}
