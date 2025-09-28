import { redirect } from 'next/navigation'
import { ShippingForm } from '@/components/checkout/shipping-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/auth'
import { OrderSummary } from '@/components/checkout/order-summary'

export default async function CheckoutPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/checkout')
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50'>
      <div className='container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        {/* Page Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-brand mb-4'>Secure Checkout</h1>
          <p className='text-lg text-gray-600'>Complete your order with confidence</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          {/* Shipping Information */}
          <div className='space-y-6'>
            <Card className='shadow-card border-0'>
              <CardHeader className='bg-gradient-to-r from-brand to-brand-600 text-white rounded-t-lg'>
                <CardTitle className='text-xl flex items-center gap-2'>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <ShippingForm />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className='space-y-6'>
            <Card className='shadow-card border-0 sticky top-8'>
              <CardHeader className='bg-gradient-to-r from-gold to-yellow-500 text-white rounded-t-lg'>
                <CardTitle className='text-xl flex items-center gap-2'>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <OrderSummary />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
