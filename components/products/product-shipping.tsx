'use client'

import { Truck, Clock, Shield, MapPin, Package, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface ProductShippingProps {
  product: {
    id: string
    name: string
    price: number
  }
}

export function ProductShipping({ product }: ProductShippingProps) {
  const isFreeShipping = product.price >= 200
  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3)

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 display-font">
          <Truck className="h-5 w-5 text-brand" />
          Shipping & Delivery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Free Shipping Banner */}
        {isFreeShipping && (
          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                🎉 FREE SHIPPING on this order!
              </span>
            </div>
          </div>
        )}

        {/* Shipping Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                <Truck className="h-4 w-4 text-brand" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Standard Delivery</p>
                <p className="text-sm text-gray-600">3-5 business days</p>
              </div>
            </div>
            <div className="text-right">
              {isFreeShipping ? (
                <Badge className="bg-green-100 text-green-800">FREE</Badge>
              ) : (
                <span className="font-medium">AED 10</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gold-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Express Delivery</p>
                <p className="text-sm text-gray-600">1-2 business days</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-medium">AED 25</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Delivery Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Delivery Areas</p>
              <p className="text-xs text-gray-600">UAE: Dubai, Abu Dhabi, Sharjah, Ajman</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Package className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Estimated Delivery</p>
              <p className="text-xs text-gray-600">
                {estimatedDelivery.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Secure Packaging</p>
              <p className="text-xs text-gray-600">Professional packaging & handling</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Installation Service */}
        <div className="p-3 bg-gradient-to-r from-brand-50 to-gold-50 border border-brand-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-900">Professional Installation Available</p>
              <p className="text-xs text-brand-700 mt-1">
                Our certified technicians can install your lighting fixtures professionally. 
                Contact us for a free quote!
              </p>
              <button className="text-xs text-brand font-medium hover:underline mt-2">
                Learn More →
              </button>
            </div>
          </div>
        </div>

        {/* Return Policy */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-600">
            <Shield className="h-3 w-3 inline mr-1" />
            30-day return policy • 2-year warranty included
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
