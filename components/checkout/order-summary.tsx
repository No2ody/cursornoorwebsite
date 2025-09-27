'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/store/use-cart'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

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

export function OrderSummary() {
  const cart = useCart()
  const items = cart.items
  const [calculationResult, setCalculationResult] = useState<CartCalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Convert cart items to the format expected by the promotion system
  const cartItems = items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.price
  }))

  // Calculate promotions
  useEffect(() => {
    const calculatePromotions = async () => {
      if (items.length === 0) {
        setCalculationResult({
          subtotal: 0,
          appliedPromotions: [],
          totalDiscount: 0,
          shippingCost: 0,
          taxAmount: 0,
          total: 0
        })
        return
      }

      setIsCalculating(true)
      try {
        const response = await fetch('/api/promotions/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: cartItems,
            appliedCoupons: []
          }),
        })

        if (response.ok) {
          const result = await response.json()
          setCalculationResult(result)
        } else {
          // Fallback calculation
          const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
          const shipping = 10
          const tax = subtotal * 0.1
          setCalculationResult({
            subtotal,
            appliedPromotions: [],
            totalDiscount: 0,
            shippingCost: shipping,
            taxAmount: tax,
            total: subtotal + shipping + tax
          })
        }
      } catch (error) {
        console.error('Error calculating promotions:', error)
        // Fallback calculation
        const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
        const shipping = 10
        const tax = subtotal * 0.1
        setCalculationResult({
          subtotal,
          appliedPromotions: [],
          totalDiscount: 0,
          shippingCost: shipping,
          taxAmount: tax,
          total: subtotal + shipping + tax
        })
      } finally {
        setIsCalculating(false)
      }
    }

    calculatePromotions()
  }, [items, cartItems]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback values
  const fallbackSubtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
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

  return (
    <div className='space-y-6'>
      <ScrollArea className='h-[300px] pr-4'>
        {items.map((item) => (
          <div key={item.id} className='flex items-start space-x-4 py-4'>
            <div className='relative h-16 w-16 overflow-hidden rounded-lg'>
              <Image
                src={item.image}
                alt={item.name}
                fill
                className='object-cover'
              />
            </div>
            <div className='flex-1 space-y-1'>
              <h3 className='font-medium'>{item.name}</h3>
              <p className='text-sm text-gray-500'>Qty: {item.quantity}</p>
              <p className='text-sm font-medium'>
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </ScrollArea>

      <Separator />

      <div className='space-y-4'>
        {isCalculating && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-brand mr-2" />
            <span className="text-sm text-gray-600">Calculating promotions...</span>
          </div>
        )}
        
        {/* Applied Promotions */}
        {displayValues.appliedPromotions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-600">Applied Promotions:</h4>
            {displayValues.appliedPromotions.map((promotion) => (
              <div key={promotion.promotionId} className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-sm text-green-800">{promotion.description}</span>
                <span className="text-sm font-medium text-green-600">-{formatPrice(promotion.discountAmount)}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className='flex justify-between text-sm'>
          <span>Subtotal</span>
          <span>{formatPrice(displayValues.subtotal)}</span>
        </div>
        
        {displayValues.totalDiscount > 0 && (
          <div className='flex justify-between text-sm text-green-600'>
            <span>Total Discount</span>
            <span>-{formatPrice(displayValues.totalDiscount)}</span>
          </div>
        )}
        
        <div className='flex justify-between text-sm'>
          <span>Shipping</span>
          <span>
            {displayValues.shippingCost === 0 ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Free</Badge>
            ) : (
              formatPrice(displayValues.shippingCost)
            )}
          </span>
        </div>
        
        <div className='flex justify-between text-sm'>
          <span>Tax (10%)</span>
          <span>{formatPrice(displayValues.taxAmount)}</span>
        </div>
        
        <Separator />
        
        <div className='flex justify-between font-medium text-lg'>
          <span>Total</span>
          <span className="text-brand">{formatPrice(displayValues.total)}</span>
        </div>
        
        {displayValues.totalDiscount > 0 && (
          <div className="text-center">
            <Badge className="bg-green-100 text-green-800">
              You saved {formatPrice(displayValues.totalDiscount)}!
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
