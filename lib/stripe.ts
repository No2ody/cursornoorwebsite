import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
})

// Client-side Stripe instance
export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
  }
  
  return window.Stripe ? window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) : null
}

// Helper function to format currency for Stripe (cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100) // Convert to cents
}

// Helper function to format currency for display
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100 // Convert from cents
}

// Advanced payment method configurations for Stripe
export const STRIPE_PAYMENT_METHODS = {
  // Card payments
  card: {
    type: 'card' as const,
    displayName: 'Credit/Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: 'credit-card',
    supportedCurrencies: ['aed', 'usd', 'eur'],
    processingFee: 2.9,
  },
  
  // Digital wallets
  apple_pay: {
    type: 'apple_pay' as const,
    displayName: 'Apple Pay',
    description: 'Pay securely with Touch ID or Face ID',
    icon: 'apple-pay',
    supportedCurrencies: ['aed', 'usd'],
    processingFee: 2.9,
  },
  
  google_pay: {
    type: 'google_pay' as const,
    displayName: 'Google Pay',
    description: 'Fast and secure payments',
    icon: 'google-pay',
    supportedCurrencies: ['aed', 'usd'],
    processingFee: 2.9,
  },
  
  // Bank transfers and local methods
  sepa_debit: {
    type: 'sepa_debit' as const,
    displayName: 'SEPA Direct Debit',
    description: 'Direct debit from your bank account',
    icon: 'bank-transfer',
    supportedCurrencies: ['eur'],
    processingFee: 0.35,
  },
  
  // UAE-specific methods (through Stripe)
  alipay: {
    type: 'alipay' as const,
    displayName: 'Alipay',
    description: 'Popular digital wallet',
    icon: 'alipay',
    supportedCurrencies: ['aed', 'usd'],
    processingFee: 3.4,
  },
  
  // Buy now, pay later
  klarna: {
    type: 'klarna' as const,
    displayName: 'Klarna',
    description: 'Pay in 4 interest-free installments',
    icon: 'klarna',
    supportedCurrencies: ['aed', 'usd', 'eur'],
    processingFee: 3.29,
    minimumAmount: 1,
    maximumAmount: 10000,
  },
  
  afterpay_clearpay: {
    type: 'afterpay_clearpay' as const,
    displayName: 'Afterpay',
    description: 'Buy now, pay later in 4 installments',
    icon: 'afterpay',
    supportedCurrencies: ['aed', 'usd'],
    processingFee: 6.0,
    minimumAmount: 1,
    maximumAmount: 2000,
  }
}

// Get available payment methods based on amount and currency
export const getAvailableStripePaymentMethods = (
  amount: number,
  currency: string = 'aed'
): string[] => {
  // For now, use only the most basic and widely supported payment methods
  // This ensures compatibility and reduces errors
  return ['card'] // Start with just credit/debit cards which are universally supported
  
  // TODO: Re-enable other payment methods after ensuring they're properly configured
  // const methods: string[] = []
  // 
  // Object.entries(STRIPE_PAYMENT_METHODS).forEach(([key, config]) => {
  //   // Check currency support
  //   if (!config.supportedCurrencies.includes(currency.toLowerCase())) return
  //   
  //   // Check amount limits
  //   if ((config as any).minimumAmount && amount < (config as any).minimumAmount) return
  //   if ((config as any).maximumAmount && amount > (config as any).maximumAmount) return
  //   
  //   methods.push(config.type) // Push the Stripe-compatible type, not the key
  // })
  // 
  // return methods.length > 0 ? methods : ['card'] // Fallback to card if no methods available
}

// Calculate processing fees
export const calculateStripeProcessingFee = (
  amount: number,
  paymentMethodType: string
): number => {
  const method = STRIPE_PAYMENT_METHODS[paymentMethodType as keyof typeof STRIPE_PAYMENT_METHODS]
  if (!method || !method.processingFee) return 0
  
  // Percentage-based fee
  if (method.processingFee < 10) {
    return (amount * method.processingFee) / 100
  }
  
  // Fixed fee (in AED)
  return method.processingFee
}

// Create payment intent with advanced options
export const createAdvancedPaymentIntent = async (
  amount: number,
  currency: string = 'aed',
  paymentMethodTypes: string[] = ['card'],
  metadata: Record<string, string> = {},
  options: {
    customerId?: string
    description?: string
    receiptEmail?: string
    setupFutureUsage?: 'on_session' | 'off_session'
    captureMethod?: 'automatic' | 'manual'
  } = {}
) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: formatAmountForStripe(amount),
    currency: currency.toLowerCase(),
    payment_method_types: paymentMethodTypes,
    metadata,
    customer: options.customerId,
    description: options.description,
    receipt_email: options.receiptEmail,
    setup_future_usage: options.setupFutureUsage,
    capture_method: options.captureMethod || 'automatic',
    // Enable automatic payment methods for better conversion
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'always'
    },
  })
  
  return paymentIntent
}

// Create customer for saved payment methods
export const createStripeCustomer = async (
  email: string,
  name?: string,
  phone?: string,
  metadata: Record<string, string> = {}
) => {
  const customer = await stripe.customers.create({
    email,
    name,
    phone,
    metadata,
  })
  
  return customer
}

// Save payment method for future use
export const attachPaymentMethodToCustomer = async (
  paymentMethodId: string,
  customerId: string
) => {
  const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  })
  
  return paymentMethod
}

// Get customer's saved payment methods
export const getCustomerPaymentMethods = async (
  customerId: string,
  type: 'card' | 'all' = 'all'
) => {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: type === 'all' ? undefined : type,
  })
  
  return paymentMethods
}

// Refund payment
export const createRefund = async (
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
) => {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? formatAmountForStripe(amount) : undefined,
    reason,
  })
  
  return refund
}

// Webhook signature verification
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
) => {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret)
    return event
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw error
  }
}