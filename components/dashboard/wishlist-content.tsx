'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useCart } from '@/store/use-cart'
import { useWishlist } from '@/store/use-wishlist'
import { formatPrice } from '@/lib/utils'

interface WishlistItem {
  id: string
  createdAt: string
  product: {
    id: string
    name: string
    price: number
    images: string[]
    category: {
      name: string
    }
  }
}

export function WishlistContent() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { addItem: addToCart } = useCart()
  const { removeItem, clearWishlist } = useWishlist()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchWishlist = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/wishlist')
      const data = await response.json()

      if (response.ok) {
        setWishlistItems(data.wishlistItems)
      } else {
        throw new Error(data.error || 'Failed to fetch wishlist')
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load wishlist items",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (session) {
      fetchWishlist()
    }
  }, [session, fetchWishlist])

  const handleRemoveItem = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId))
        removeItem(productId)
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist",
        })
      } else {
        throw new Error('Failed to remove item')
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive"
      })
    }
  }

  const handleAddToCart = (product: WishlistItem['product']) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.jpg',
      quantity: 1,
    })
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  const handleClearWishlist = async () => {
    try {
      // Remove all items from database
      for (const item of wishlistItems) {
        await fetch(`/api/wishlist?productId=${item.product.id}`, {
          method: 'DELETE',
        })
      }
      
      setWishlistItems([])
      clearWishlist()
      toast({
        title: "Wishlist cleared",
        description: "All items have been removed from your wishlist",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to clear wishlist",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading your wishlist...</p>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Your wishlist is empty</h3>
        <p className="text-muted-foreground mb-6">
          Start adding products you love to your wishlist!
        </p>
        <Button asChild>
          <Link href="/products">
            Browse Products
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
          </p>
        </div>
        {wishlistItems.length > 0 && (
          <Button variant="outline" onClick={handleClearWishlist}>
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="group">
            <CardHeader className="p-0">
              <div className="relative aspect-square">
                <Image
                  src={item.product.images[0] || '/placeholder.jpg'}
                  alt={item.product.name}
                  fill
                  className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                  onClick={() => handleRemoveItem(item.product.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {item.product.category.name}
                  </Badge>
                  <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/products/${item.product.id}`}>
                      {item.product.name}
                    </Link>
                  </h3>
                  <p className="text-lg font-bold text-primary">
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleAddToCart(item.product)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/products/${item.product.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
