'use client'

import { useState } from 'react'
import { useCart } from '@/store/use-cart'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Trash2, Plus, Minus, CreditCard, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { AdvancedDiscountCode } from '@/components/cart/advanced-discount-code'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'

interface CartCalculationResult {
  subtotal: number
  appliedPromotions: Array<{
    promotionId: string
    promotionName: string
    promotionCode?: string
    discountAmount: number
    freeShipping?: boolean
    description: string
  }>
  totalDiscount: number
  shippingCost: number
  taxAmount: number
  total: number
}

export default function CartPage() {
  const cart = useCart()
  const [appliedCoupons, setAppliedCoupons] = useState<string[]>([])
  const [calculationResult, setCalculationResult] = useState<CartCalculationResult | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()

  // Convert cart items to the format expected by the promotion system
  const cartItems = cart.items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.price
  }))

  // Fallback calculation if promotion system hasn't calculated yet
  const fallbackSubtotal = cart.getTotal()
  const fallbackShipping = 10
  const fallbackTax = fallbackSubtotal * 0.1
  const fallbackTotal = fallbackSubtotal + fallbackShipping + fallbackTax

  const displayValues = calculationResult || {
    subtotal: fallbackSubtotal,
    appliedPromotions: [],
    totalDiscount: 0,
    shippingCost: fallbackShipping,
    taxAmount: fallbackTax,
    total: fallbackTotal
  }

  // Handle direct checkout to Stripe
  const handleCheckout = async () => {
    if (!session) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to proceed with checkout.',
        variant: 'destructive',
      })
      // Redirect to sign in with return URL
      window.location.href = '/auth/signin?callbackUrl=' + encodeURIComponent('/cart')
      return
    }

    if (cart.items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before checking out.',
        variant: 'destructive',
      })
      return
    }

    setIsCheckingOut(true)

    try {
      // Calculate products subtotal for server validation
      const productsSubtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          totalAmount: productsSubtotal, // Send only products subtotal for validation
          appliedCoupons: appliedCoupons, // Include any applied coupons
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      // Clear cart and redirect to Stripe Checkout
      cart.clearCart()
      
      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error('[CART_CHECKOUT]', error)
      toast({
        title: 'Checkout Error',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className='bg-gradient-to-br from-gray-50 via-white to-brand-50 min-h-[calc(100vh-8rem)]'>
        <div className='container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]'>
          <Card className='max-w-md w-full shadow-card border-0 text-center'>
            <CardHeader className='pb-4'>
              <div className='mx-auto w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4'>
                <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
                </svg>
              </div>
              <CardTitle className='text-2xl text-brand'>Your cart is empty</CardTitle>
            </CardHeader>
            <CardContent className='pb-6'>
              <p className='text-gray-600 mb-6'>
                Discover our premium lighting and bathroom fixtures to get started.
              </p>
            </CardContent>
            <CardFooter className='pt-0'>
              <Button asChild className='w-full btn-brand'>
                <Link href='/products'>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Continue Shopping
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-gradient-to-br from-gray-50 via-white to-brand-50 min-h-[calc(100vh-8rem)]'>
      <div className='container mx-auto px-4 py-8 max-w-6xl'>
        {/* Page Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-brand mb-2'>Shopping Cart</h1>
          <p className='text-gray-600'>Review your items before checkout</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Cart Items */}
          <div className='lg:col-span-2'>
            <Card className='shadow-card border-0'>
              <CardHeader className='bg-gradient-to-r from-brand to-brand-600 text-white rounded-t-lg'>
                <CardTitle className='text-xl flex items-center gap-2'>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
                  </svg>
                  Your Items ({cart.items.length})
                </CardTitle>
              </CardHeader>
            <CardContent className='space-y-4'>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className='flex items-center gap-4 py-4 border-b last:border-0'
                >
                  <div className='relative aspect-square h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border'>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className='flex flex-1 flex-col'>
                    <Link
                      href={`/products/${item.productId}`}
                      className='font-medium hover:underline text-lg'
                    >
                      {item.name}
                    </Link>
                    <span className='text-muted-foreground text-lg font-medium'>
                      AED {item.price.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className='h-8 w-8'
                    >
                      <Minus className='h-3 w-3' />
                    </Button>
                    <span className='w-12 text-center font-medium'>{item.quantity}</span>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                      className='h-8 w-8'
                    >
                      <Plus className='h-3 w-3' />
                    </Button>
                  </div>
                  <div className='text-right min-w-[120px]'>
                    <div className='font-semibold text-lg'>
                      AED {(item.price * item.quantity).toFixed(2)}
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => cart.removeItem(item.productId)}
                      className='text-destructive hover:text-destructive mt-1'
                    >
                      <Trash2 className='h-4 w-4 mr-1' />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Advanced Promotions & Order Summary */}
        <div className='space-y-6'>
          {/* Advanced Discount Code with Promotions */}
          <Card className='shadow-card border-0'>
            <CardHeader className='bg-gradient-to-r from-gold to-yellow-500 text-white rounded-t-lg'>
              <CardTitle className='text-xl flex items-center gap-2'>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Promotions & Discounts
              </CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
              <AdvancedDiscountCode
                items={cartItems}
                onPromotionsCalculated={setCalculationResult}
                appliedCoupons={appliedCoupons}
                onCouponsChange={setAppliedCoupons}
              />
            </CardContent>
          </Card>

          {/* Checkout Actions */}
          <Card className="shadow-card border-0 sticky top-8">
            <CardHeader>
              <CardTitle className="text-xl">Ready to Complete Your Order?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-brand-50 to-gold-50 rounded-lg border border-brand-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-brand">Final Total</span>
                    <span className="text-2xl font-bold text-brand">AED {displayValues.total.toFixed(2)}</span>
                  </div>
                  {displayValues.totalDiscount > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      You saved AED {displayValues.totalDiscount.toFixed(2)}!
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex flex-col gap-3'>
              <Button 
                className='w-full btn-brand' 
                size='lg' 
                onClick={handleCheckout}
                disabled={isCheckingOut || cart.items.length === 0}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Complete Order
                  </>
                )}
              </Button>
              <Button variant='outline' className='w-full' asChild>
                <Link href='/products'>Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        </div>
      </div>
    </div>
  )
}
