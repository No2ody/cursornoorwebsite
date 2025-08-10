'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useWishlist } from '@/store/use-wishlist'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  product: {
    id: string
    name: string
    price: number
    images: string[]
    categoryId: string
  }
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function WishlistButton({ 
  product, 
  className, 
  variant = 'outline',
  size = 'default'
}: WishlistButtonProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { isInWishlist, addItem, removeItem } = useWishlist()
  const [isLoading, setIsLoading] = useState(false)
  const [isInList, setIsInList] = useState(false)

  useEffect(() => {
    setIsInList(isInWishlist(product.id))
  }, [product.id, isInWishlist])

  const handleToggleWishlist = async () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      if (isInList) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?productId=${product.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          removeItem(product.id)
          setIsInList(false)
          toast({
            title: "Removed from wishlist",
            description: `${product.name} has been removed from your wishlist`,
          })
        } else {
          throw new Error('Failed to remove from wishlist')
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
          }),
        })

        if (response.ok) {
          addItem(product)
          setIsInList(true)
          toast({
            title: "Added to wishlist",
            description: `${product.name} has been added to your wishlist`,
          })
        } else {
          const data = await response.json()
          throw new Error(data.error || 'Failed to add to wishlist')
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const IconComponent = Heart
  const isIconButton = size === 'icon'

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={cn(
        "transition-colors",
        isInList && "text-red-500 border-red-500 hover:text-red-600 hover:border-red-600",
        className
      )}
    >
      <IconComponent 
        className={cn(
          isIconButton ? "h-4 w-4" : "h-4 w-4 mr-2",
          isInList && "fill-current"
        )} 
      />
      {!isIconButton && (
        <span>
          {isLoading ? 'Loading...' : isInList ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </Button>
  )
}
