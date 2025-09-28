'use client'

import { useState, useEffect } from 'react'
import { Tag, Gift, Percent, Clock, Users, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface ProductPromotionsProps {
  product: {
    id: string
    name: string
    price: number
    categoryId: string
  }
}

interface Promotion {
  id: string
  name: string
  description?: string
  type: string
  discountValue: number
  code?: string
  endDate?: string
  minimumOrderValue?: number
}

export function ProductPromotions({ product }: ProductPromotionsProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        // Simulate fetching product-specific promotions
        // In a real app, this would be an API call
        const mockPromotions: Promotion[] = [
          {
            id: '1',
            name: 'New Customer Special',
            description: '15% off your first order',
            type: 'PERCENTAGE',
            discountValue: 15,
            code: 'WELCOME15',
            minimumOrderValue: 50
          },
          {
            id: '2',
            name: 'Lighting Category Sale',
            description: '20% off all lighting products',
            type: 'PERCENTAGE',
            discountValue: 20,
            code: 'LIGHT20',
            endDate: '2024-12-31',
            minimumOrderValue: 100
          },
          {
            id: '3',
            name: 'Bulk Order Discount',
            description: 'Save more when you buy 5+ items',
            type: 'BULK_DISCOUNT',
            discountValue: 10
          }
        ]

        // Filter promotions that might apply to this product
        const applicablePromotions = mockPromotions.filter(promo => {
          if (promo.minimumOrderValue && product.price < promo.minimumOrderValue) {
            return false
          }
          return true
        })

        setPromotions(applicablePromotions)
      } catch (error) {
        console.error('Error fetching promotions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPromotions()
  }, [product.id, product.price])

  if (loading) {
    return (
      <Card className="card-enhanced">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (promotions.length === 0) {
    return null
  }

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return <Percent className="h-4 w-4" />
      case 'BULK_DISCOUNT':
        return <Users className="h-4 w-4" />
      default:
        return <Gift className="h-4 w-4" />
    }
  }

  const getPromotionColor = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return 'from-green-50 to-emerald-50 border-green-200'
      case 'BULK_DISCOUNT':
        return 'from-blue-50 to-cyan-50 border-blue-200'
      default:
        return 'from-purple-50 to-pink-50 border-purple-200'
    }
  }

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 display-font">
          <Sparkles className="h-5 w-5 text-gold" />
          Available Promotions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {promotions.map((promotion, index) => (
          <div key={promotion.id}>
            <div className={`p-4 bg-gradient-to-r ${getPromotionColor(promotion.type)} border rounded-lg`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    {getPromotionIcon(promotion.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {promotion.name}
                    </h4>
                    {promotion.description && (
                      <p className="text-sm text-gray-700 mb-2">
                        {promotion.description}
                      </p>
                    )}
                    
                    {/* Promotion Details */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {promotion.code && (
                        <Badge variant="secondary" className="bg-white/80">
                          Code: {promotion.code}
                        </Badge>
                      )}
                      {promotion.minimumOrderValue && (
                        <Badge variant="outline" className="text-xs">
                          Min: AED {promotion.minimumOrderValue}
                        </Badge>
                      )}
                      {promotion.endDate && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Until {new Date(promotion.endDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {promotion.type === 'PERCENTAGE' ? `${promotion.discountValue}%` : `AED ${promotion.discountValue}`}
                  </div>
                  <div className="text-xs text-gray-600">OFF</div>
                </div>
              </div>
              
              {promotion.code && (
                <div className="mt-3 pt-3 border-t border-white/50">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full bg-white/80 hover:bg-white text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(promotion.code!)
                      // You could add a toast notification here
                    }}
                  >
                    <Tag className="h-3 w-3 mr-2" />
                    Copy Code: {promotion.code}
                  </Button>
                </div>
              )}
            </div>
            
            {index < promotions.length - 1 && <Separator className="my-3" />}
          </div>
        ))}
        
        {/* Additional Promotion Info */}
        <div className="p-3 bg-gradient-to-r from-brand-50 to-gold-50 border border-brand-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-brand" />
            <p className="text-sm text-brand-800">
              <span className="font-medium">Pro Tip:</span> Add items to cart to see all applicable discounts automatically applied!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
