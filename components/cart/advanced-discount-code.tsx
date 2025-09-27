'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Tag, XCircle, CheckCircle, Loader2, Sparkles, Gift, Percent } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface PromotionCalculation {
  promotionId: string
  promotionName: string
  promotionCode?: string
  discountAmount: number
  freeShipping?: boolean
  description: string
  applicableItems: string[]
}

interface CartCalculationResult {
  subtotal: number
  appliedPromotions: PromotionCalculation[]
  totalDiscount: number
  shippingCost: number
  taxAmount: number
  total: number
  availablePromotions?: Array<{
    id: string
    name: string
    description?: string
    type: string
    discountValue: number
  }>
}

interface AdvancedDiscountCodeProps {
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  onPromotionsCalculated: (result: CartCalculationResult) => void
  appliedCoupons: string[]
  onCouponsChange: (coupons: string[]) => void
}

export function AdvancedDiscountCode({ 
  items, 
  onPromotionsCalculated, 
  appliedCoupons, 
  onCouponsChange 
}: AdvancedDiscountCodeProps) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationResult, setCalculationResult] = useState<CartCalculationResult | null>(null)
  const { toast } = useToast()

  // Calculate promotions whenever items or coupons change
  useEffect(() => {
    if (items.length > 0) {
      calculatePromotions()
    } else {
      // Reset calculation result when cart is empty
      setCalculationResult({
        subtotal: 0,
        appliedPromotions: [],
        totalDiscount: 0,
        shippingCost: 0,
        taxAmount: 0,
        total: 0
      })
      onPromotionsCalculated({
        subtotal: 0,
        appliedPromotions: [],
        totalDiscount: 0,
        shippingCost: 0,
        taxAmount: 0,
        total: 0
      })
    }
  }, [items, appliedCoupons]) // eslint-disable-line react-hooks/exhaustive-deps

  const calculatePromotions = async () => {
    setIsCalculating(true)
    try {
      const response = await fetch('/api/promotions/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          appliedCoupons
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setCalculationResult(result)
        onPromotionsCalculated(result)
      } else {
        console.error('Failed to calculate promotions')
      }
    } catch (calculationError) {
      console.error('Error calculating promotions:', calculationError)
    } finally {
      setIsCalculating(false)
    }
  }

  const validateAndApplyCoupon = async () => {
    if (!code.trim()) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a coupon code.',
        variant: 'destructive',
      })
      return
    }

    if (appliedCoupons.includes(code.trim().toUpperCase())) {
      toast({
        title: 'Already Applied',
        description: 'This coupon code is already applied.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      // First validate the coupon
      const validateResponse = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase()
        }),
      })

      const validation = await validateResponse.json()

      if (!validation.valid) {
        toast({
          title: 'Invalid Coupon',
          description: validation.message || 'The coupon code is not valid.',
          variant: 'destructive',
        })
        return
      }

      // Add the coupon and recalculate
      const newCoupons = [...appliedCoupons, code.trim().toUpperCase()]
      onCouponsChange(newCoupons)
      setCode('')

      toast({
        title: 'Coupon Applied!',
        description: `Successfully applied coupon: ${code.trim().toUpperCase()}`,
      })

    } catch (validationError) {
      console.error('Validation error:', validationError)
      toast({
        title: 'Error',
        description: 'Failed to apply coupon code. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeCoupon = (couponCode: string) => {
    const newCoupons = appliedCoupons.filter(c => c !== couponCode)
    onCouponsChange(newCoupons)
    
    toast({
      title: 'Coupon Removed',
      description: `Removed coupon: ${couponCode}`,
    })
  }

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Tag className="h-5 w-5 text-brand" /> 
          Promotions & Discounts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Coupon Code Input */}
        <div className="space-y-3">
          <Label htmlFor="coupon-code" className="text-sm font-medium">
            Enter Coupon Code
          </Label>
          <div className="flex gap-2">
            <Input
              id="coupon-code"
              placeholder="Enter coupon code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="input-enhanced"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  validateAndApplyCoupon()
                }
              }}
            />
            <Button 
              onClick={validateAndApplyCoupon} 
              disabled={isLoading || !code.trim()} 
              className="btn-brand"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Applied Coupons */}
        {appliedCoupons.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Applied Coupons</Label>
            <div className="space-y-2">
              {appliedCoupons.map((couponCode) => (
                <div key={couponCode} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">{couponCode}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeCoupon(couponCode)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applied Promotions */}
        {calculationResult && calculationResult.appliedPromotions.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              Active Promotions
            </Label>
            <div className="space-y-2">
              {calculationResult.appliedPromotions.map((promotion) => (
                <div key={promotion.promotionId} className="p-3 bg-gradient-to-r from-brand-50 to-gold-50 border border-brand-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-brand" />
                      <div>
                        <p className="font-medium text-brand">{promotion.promotionName}</p>
                        <p className="text-sm text-brand-700">{promotion.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand">-AED {promotion.discountAmount.toFixed(2)}</p>
                      {promotion.freeShipping && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          Free Shipping
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Promotions */}
        {calculationResult && calculationResult.availablePromotions && calculationResult.availablePromotions.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Percent className="h-4 w-4 text-gray-500" />
              Available Promotions
            </Label>
            <div className="space-y-2">
              {calculationResult.availablePromotions.map((promotion) => (
                <div key={promotion.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{promotion.name}</p>
                      {promotion.description && (
                        <p className="text-sm text-gray-600">{promotion.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-gray-600">
                      {promotion.type === 'PERCENTAGE' ? `${promotion.discountValue}% off` : `AED ${promotion.discountValue} off`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculation Summary */}
        {calculationResult && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>AED {calculationResult.subtotal.toFixed(2)}</span>
            </div>
            
            {calculationResult.totalDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Total Discount</span>
                <span>-AED {calculationResult.totalDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>
                {calculationResult.shippingCost === 0 ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Free</Badge>
                ) : (
                  `AED ${calculationResult.shippingCost.toFixed(2)}`
                )}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Tax (10%)</span>
              <span>AED {calculationResult.taxAmount.toFixed(2)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-brand">AED {calculationResult.total.toFixed(2)}</span>
            </div>
            
            {calculationResult.totalDiscount > 0 && (
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800">
                  You saved AED {calculationResult.totalDiscount.toFixed(2)}!
                </Badge>
              </div>
            )}
          </div>
        )}

        {isCalculating && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
            <span className="ml-2 text-sm text-gray-600">Calculating promotions...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
