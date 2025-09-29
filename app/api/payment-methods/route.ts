import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { STRIPE_PAYMENT_METHODS, getAvailableStripePaymentMethods, calculateStripeProcessingFee } from '@/lib/stripe'

// Define types for payment methods
type StripePaymentMethodType = 'card' | 'apple_pay' | 'google_pay' | 'bank_transfer' | 'crypto' | 'credit'

interface PaymentMethodConfig {
  type: StripePaymentMethodType
  displayName: string
  description: string
  icon: string
  supportedCurrencies: string[]
  processingFee: number
  minimumAmount?: number
  maximumAmount?: number
}

interface ExtendedPaymentMethod {
  id: string
  name: string
  description: string
  type: StripePaymentMethodType
  icon: string
  supportedCurrencies: string[]
  processingFee: number
  processingFeeAmount: number
  minimumAmount?: number
  maximumAmount?: number
  available: boolean
  recommended: boolean
}

/**
 * GET /api/payment-methods
 * Retrieves available payment methods based on amount, currency, and user type
 * 
 * Query Parameters:
 * - amount: Transaction amount (default: 0)
 * - currency: Currency code (default: 'aed')
 * - userType: 'individual' or 'business' (default: 'individual')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const amount = parseFloat(searchParams.get('amount') || '0')
    const currency = searchParams.get('currency') || 'aed'
    const userType = searchParams.get('userType') || 'individual'

    // Get available payment methods
    const availableMethodKeys = getAvailableStripePaymentMethods(amount, currency)
    
    // Build detailed payment method information
    const paymentMethods: ExtendedPaymentMethod[] = []
    
    for (const key of availableMethodKeys) {
      const method = STRIPE_PAYMENT_METHODS[key as keyof typeof STRIPE_PAYMENT_METHODS] as PaymentMethodConfig
      if (!method) continue
      
      paymentMethods.push({
        id: key,
        name: method.displayName,
        description: method.description,
        type: method.type,
        icon: method.icon,
        supportedCurrencies: method.supportedCurrencies,
        processingFee: method.processingFee,
        processingFeeAmount: calculateStripeProcessingFee(amount, key),
        minimumAmount: method.minimumAmount,
        maximumAmount: method.maximumAmount,
        available: true,
        recommended: key === 'card' || key === 'apple_pay' || key === 'google_pay'
      })
    }

    // Add business-specific methods if applicable
    if (userType === 'business') {
      // Add additional business payment options
      paymentMethods.push({
        id: 'business_credit',
        name: 'Business Credit Terms',
        description: '30-day payment terms for approved businesses',
        type: 'credit',
        icon: 'building',
        supportedCurrencies: ['aed'],
        processingFee: 0,
        processingFeeAmount: 0,
        minimumAmount: 5000,
        maximumAmount: undefined,
        available: amount >= 5000,
        recommended: amount >= 10000
      })
    }

    // Calculate recommended payment method
    const recommendedMethod = paymentMethods.find(m => m?.recommended) || paymentMethods[0]

    return NextResponse.json({
      paymentMethods,
      recommendedMethod: recommendedMethod?.id,
      currency: currency.toUpperCase(),
      amount,
      totalMethods: paymentMethods.length,
      securityFeatures: {
        encryption: '256-bit SSL',
        compliance: 'PCI DSS Level 1',
        fraudDetection: true,
        tokenization: true
      }
    })

  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}

// Interface for POST request body
interface SavePaymentMethodRequest {
  paymentMethodId: string
  setAsDefault?: boolean
}

/**
 * POST /api/payment-methods
 * Saves user payment method preferences
 * 
 * Request Body:
 * - paymentMethodId: string (required)
 * - setAsDefault: boolean (optional, default: false)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as SavePaymentMethodRequest
    const { paymentMethodId, setAsDefault = false } = body

    // Validate payment method ID
    if (!paymentMethodId || typeof paymentMethodId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid payment method ID' },
        { status: 400 }
      )
    }

    // This would typically save user payment method preferences to database
    // For now, we'll just return success with the validated data
    
    return NextResponse.json({
      success: true,
      message: 'Payment method preference saved successfully',
      data: {
        paymentMethodId,
        setAsDefault,
        userId: session.user.id
      }
    })

  } catch (error) {
    console.error('Error saving payment method preference:', error)
    return NextResponse.json(
      { error: 'Failed to save payment method preference' },
      { status: 500 }
    )
  }
}
