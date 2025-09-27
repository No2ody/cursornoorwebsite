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
import { Trash2, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { AdvancedDiscountCode } from '@/components/cart/advanced-discount-code'

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

  if (cart.items.length === 0) {
    return (
      <div className='container mx-auto px-4 pt-32 pb-16'>
        <Card>
          <CardHeader>
            <CardTitle>Your cart is empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              Add some products to your cart to see them here.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href='/products'>Continue Shopping</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 pt-32 pb-8 max-w-6xl'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Cart Items */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl'>Shopping Cart ({cart.items.length} items)</CardTitle>
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
          <AdvancedDiscountCode
            items={cartItems}
            onPromotionsCalculated={setCalculationResult}
            appliedCoupons={appliedCoupons}
            onCouponsChange={setAppliedCoupons}
          />

          {/* Checkout Actions */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-xl">Ready to Checkout?</CardTitle>
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
              <Button className='w-full btn-brand' size='lg' asChild>
                <Link href='/checkout'>Proceed to Checkout</Link>
              </Button>
              <Button variant='outline' className='w-full' asChild>
                <Link href='/products'>Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
