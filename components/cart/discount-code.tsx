'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Tag, X, Percent, Gift } from 'lucide-react'

interface DiscountCode {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  description: string
  minAmount?: number
  maxDiscount?: number
}

interface DiscountCodeProps {
  subtotal: number
  onDiscountApplied: (discount: { code: string; amount: number; description: string }) => void
  onDiscountRemoved: () => void
  appliedDiscount?: { code: string; amount: number; description: string } | null
}

// Mock discount codes - in real app, these would come from API
const DISCOUNT_CODES: Record<string, DiscountCode> = {
  'WELCOME10': {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    description: 'Welcome! Get 10% off your first order',
    minAmount: 100
  },
  'SAVE20': {
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    description: '20% off orders over AED 500',
    minAmount: 500,
    maxDiscount: 200
  },
  'FLAT50': {
    code: 'FLAT50',
    type: 'fixed',
    value: 50,
    description: 'AED 50 off any order',
    minAmount: 200
  },
  'LIGHTING15': {
    code: 'LIGHTING15',
    type: 'percentage',
    value: 15,
    description: '15% off LED lighting products',
    minAmount: 150
  },
  'NEWCUSTOMER': {
    code: 'NEWCUSTOMER',
    type: 'percentage',
    value: 25,
    description: 'Special 25% discount for new customers',
    minAmount: 300,
    maxDiscount: 150
  }
}

export function DiscountCode({ 
  subtotal, 
  onDiscountApplied, 
  onDiscountRemoved, 
  appliedDiscount 
}: DiscountCodeProps) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const validateAndApplyCode = async () => {
    if (!code.trim()) {
      toast({
        title: 'Please enter a discount code',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const upperCode = code.toUpperCase().trim()
      const discountData = DISCOUNT_CODES[upperCode]

      if (!discountData) {
        toast({
          title: 'Invalid Code',
          description: 'The discount code you entered is not valid.',
          variant: 'destructive'
        })
        return
      }

      // Check minimum amount requirement
      if (discountData.minAmount && subtotal < discountData.minAmount) {
        toast({
          title: 'Minimum Order Required',
          description: `This code requires a minimum order of AED ${discountData.minAmount}.`,
          variant: 'destructive'
        })
        return
      }

      // Calculate discount amount
      let discountAmount = 0
      if (discountData.type === 'percentage') {
        discountAmount = (subtotal * discountData.value) / 100
        if (discountData.maxDiscount) {
          discountAmount = Math.min(discountAmount, discountData.maxDiscount)
        }
      } else {
        discountAmount = discountData.value
      }

      // Ensure discount doesn't exceed subtotal
      discountAmount = Math.min(discountAmount, subtotal)

      onDiscountApplied({
        code: discountData.code,
        amount: discountAmount,
        description: discountData.description
      })

      toast({
        title: 'Discount Applied!',
        description: `You saved AED ${discountAmount.toFixed(2)} with code ${discountData.code}`,
      })

      setCode('')
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to apply discount code. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeDiscount = () => {
    onDiscountRemoved()
    toast({
      title: 'Discount Removed',
      description: 'The discount code has been removed from your order.',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Tag className="w-5 h-5 text-green-600" />
          Discount Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appliedDiscount ? (
          // Show applied discount
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">{appliedDiscount.code}</p>
                  <p className="text-sm text-green-600">{appliedDiscount.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  -AED {appliedDiscount.amount.toFixed(2)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeDiscount}
                  className="text-green-600 hover:text-green-700 hover:bg-green-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Show discount code input
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="discount-code">Enter discount code</Label>
              <div className="flex gap-2">
                <Input
                  id="discount-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter code..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && validateAndApplyCode()}
                />
                <Button 
                  onClick={validateAndApplyCode}
                  disabled={isLoading}
                  className="px-6"
                >
                  {isLoading ? 'Applying...' : 'Apply'}
                </Button>
              </div>
            </div>

            {/* Sample codes for demo */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Available codes:</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(DISCOUNT_CODES).slice(0, 3).map((discount) => (
                  <Badge
                    key={discount.code}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-50 flex items-center gap-1"
                    onClick={() => setCode(discount.code)}
                  >
                    <Percent className="w-3 h-3" />
                    {discount.code}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
