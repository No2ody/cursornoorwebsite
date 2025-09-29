// Payment method configurations and utilities
export interface PaymentMethod {
  id: string
  name: string
  type: 'card' | 'wallet' | 'bank_transfer' | 'cash' | 'crypto'
  provider: string
  icon: string
  enabled: boolean
  supportedCurrencies: string[]
  processingFee?: number
  minimumAmount?: number
  maximumAmount?: number
  description?: string
  setupRequired: boolean
}

export interface PaymentConfiguration {
  methods: PaymentMethod[]
  defaultCurrency: string
  supportedCurrencies: string[]
  securityFeatures: {
    encryption: boolean
    tokenization: boolean
    fraudDetection: boolean
    pciCompliant: boolean
  }
}

// Supported payment methods for UAE market
export const PAYMENT_METHODS: PaymentMethod[] = [
  // Credit/Debit Cards
  {
    id: 'stripe_card',
    name: 'Credit/Debit Card',
    type: 'card',
    provider: 'Stripe',
    icon: '/icons/credit-card.svg',
    enabled: true,
    supportedCurrencies: ['AED', 'USD', 'EUR'],
    processingFee: 2.9,
    description: 'Visa, Mastercard, American Express',
    setupRequired: false
  },
  
  // Digital Wallets
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    type: 'wallet',
    provider: 'Stripe',
    icon: '/icons/apple-pay.svg',
    enabled: true,
    supportedCurrencies: ['AED', 'USD'],
    description: 'Pay securely with Touch ID or Face ID',
    setupRequired: false
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    type: 'wallet',
    provider: 'Stripe',
    icon: '/icons/google-pay.svg',
    enabled: true,
    supportedCurrencies: ['AED', 'USD'],
    description: 'Fast and secure payments',
    setupRequired: false
  },
  {
    id: 'samsung_pay',
    name: 'Samsung Pay',
    type: 'wallet',
    provider: 'Stripe',
    icon: '/icons/samsung-pay.svg',
    enabled: true,
    supportedCurrencies: ['AED'],
    description: 'Pay with your Samsung device',
    setupRequired: false
  },
  
  // UAE-specific payment methods
  {
    id: 'emirates_nbd',
    name: 'Emirates NBD',
    type: 'bank_transfer',
    provider: 'Network International',
    icon: '/icons/emirates-nbd.svg',
    enabled: true,
    supportedCurrencies: ['AED'],
    description: 'Direct bank transfer',
    setupRequired: true
  },
  {
    id: 'adcb',
    name: 'ADCB',
    type: 'bank_transfer',
    provider: 'Network International',
    icon: '/icons/adcb.svg',
    enabled: true,
    supportedCurrencies: ['AED'],
    description: 'Abu Dhabi Commercial Bank',
    setupRequired: true
  },
  {
    id: 'fab',
    name: 'First Abu Dhabi Bank',
    type: 'bank_transfer',
    provider: 'Network International',
    icon: '/icons/fab.svg',
    enabled: true,
    supportedCurrencies: ['AED'],
    description: 'FAB online banking',
    setupRequired: true
  },
  
  // Cash and Alternative Methods
  {
    id: 'cash_on_delivery',
    name: 'Cash on Delivery',
    type: 'cash',
    provider: 'Internal',
    icon: '/icons/cash.svg',
    enabled: true,
    supportedCurrencies: ['AED'],
    processingFee: 0,
    maximumAmount: 5000,
    description: 'Pay when you receive your order',
    setupRequired: false
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    type: 'bank_transfer',
    provider: 'Internal',
    icon: '/icons/bank-transfer.svg',
    enabled: true,
    supportedCurrencies: ['AED', 'USD'],
    minimumAmount: 1000,
    description: 'Direct bank transfer (for large orders)',
    setupRequired: false
  },
  
  // Business Payment Methods
  {
    id: 'business_credit',
    name: 'Business Credit',
    type: 'bank_transfer',
    provider: 'Internal',
    icon: '/icons/business-credit.svg',
    enabled: true,
    supportedCurrencies: ['AED'],
    minimumAmount: 5000,
    description: '30-day payment terms for approved businesses',
    setupRequired: true
  },
  {
    id: 'installments',
    name: 'Installment Plans',
    type: 'card',
    provider: 'Tabby',
    icon: '/icons/installments.svg',
    enabled: true,
    supportedCurrencies: ['AED'],
    minimumAmount: 500,
    maximumAmount: 20000,
    description: 'Pay in 4 interest-free installments',
    setupRequired: false
  }
]

// Payment method filtering and selection
export const getAvailablePaymentMethods = (
  amount: number,
  currency: string = 'AED',
  userType: 'individual' | 'business' = 'individual'
): PaymentMethod[] => {
  return PAYMENT_METHODS.filter(method => {
    // Check if method is enabled
    if (!method.enabled) return false
    
    // Check currency support
    if (!method.supportedCurrencies.includes(currency)) return false
    
    // Check amount limits
    if (method.minimumAmount && amount < method.minimumAmount) return false
    if (method.maximumAmount && amount > method.maximumAmount) return false
    
    // Business-specific methods
    if (method.id === 'business_credit' && userType !== 'business') return false
    
    return true
  })
}

// Payment method grouping for UI
export const groupPaymentMethods = (methods: PaymentMethod[]) => {
  const groups = {
    cards: methods.filter(m => m.type === 'card'),
    wallets: methods.filter(m => m.type === 'wallet'),
    banks: methods.filter(m => m.type === 'bank_transfer'),
    alternative: methods.filter(m => m.type === 'cash' || m.type === 'crypto')
  }
  
  return groups
}

// Calculate processing fees
export const calculateProcessingFee = (amount: number, method: PaymentMethod): number => {
  if (!method.processingFee) return 0
  
  // Percentage-based fee
  if (method.processingFee < 10) {
    return (amount * method.processingFee) / 100
  }
  
  // Fixed fee
  return method.processingFee
}

// Payment security utilities
export const getSecurityFeatures = (methodId: string) => {
  const features = {
    stripe_card: ['PCI DSS Level 1', '3D Secure', 'Fraud Detection', 'Tokenization'],
    apple_pay: ['Biometric Authentication', 'Device Encryption', 'Tokenization'],
    google_pay: ['Biometric Authentication', 'Device Encryption', 'Tokenization'],
    cash_on_delivery: ['Identity Verification', 'Signature Required'],
    bank_transfer: ['Bank-level Encryption', 'Two-factor Authentication'],
    business_credit: ['Credit Verification', 'Terms Agreement', 'Invoice Tracking']
  }
  
  return features[methodId as keyof typeof features] || []
}

// Payment method validation
export const validatePaymentMethod = (
  methodId: string,
  amount: number,
  currency: string,
  userData?: any
): { valid: boolean; errors: string[] } => {
  const method = PAYMENT_METHODS.find(m => m.id === methodId)
  const errors: string[] = []
  
  if (!method) {
    errors.push('Invalid payment method')
    return { valid: false, errors }
  }
  
  if (!method.enabled) {
    errors.push('Payment method is currently unavailable')
  }
  
  if (!method.supportedCurrencies.includes(currency)) {
    errors.push(`Currency ${currency} is not supported for this payment method`)
  }
  
  if (method.minimumAmount && amount < method.minimumAmount) {
    errors.push(`Minimum amount for ${method.name} is ${method.minimumAmount} ${currency}`)
  }
  
  if (method.maximumAmount && amount > method.maximumAmount) {
    errors.push(`Maximum amount for ${method.name} is ${method.maximumAmount} ${currency}`)
  }
  
  // Business credit validation
  if (methodId === 'business_credit') {
    if (!userData?.businessVerified) {
      errors.push('Business verification required for credit terms')
    }
    if (!userData?.creditApproved) {
      errors.push('Credit approval required for business credit')
    }
  }
  
  return { valid: errors.length === 0, errors }
}

// Payment method recommendations
export const getRecommendedPaymentMethod = (
  amount: number,
  currency: string = 'AED',
  userType: 'individual' | 'business' = 'individual',
  userPreferences?: string[]
): PaymentMethod | null => {
  const availableMethods = getAvailablePaymentMethods(amount, currency, userType)
  
  if (availableMethods.length === 0) return null
  
  // Check user preferences first
  if (userPreferences) {
    for (const prefId of userPreferences) {
      const method = availableMethods.find(m => m.id === prefId)
      if (method) return method
    }
  }
  
  // Default recommendations based on amount and type
  if (userType === 'business' && amount >= 5000) {
    return availableMethods.find(m => m.id === 'business_credit') || availableMethods[0]
  }
  
  if (amount < 100) {
    return availableMethods.find(m => m.id === 'apple_pay' || m.id === 'google_pay') || availableMethods[0]
  }
  
  if (amount > 2000) {
    return availableMethods.find(m => m.id === 'bank_transfer') || availableMethods[0]
  }
  
  // Default to card payment
  return availableMethods.find(m => m.type === 'card') || availableMethods[0]
}

// Export configuration
export const PAYMENT_CONFIG: PaymentConfiguration = {
  methods: PAYMENT_METHODS,
  defaultCurrency: 'AED',
  supportedCurrencies: ['AED', 'USD', 'EUR'],
  securityFeatures: {
    encryption: true,
    tokenization: true,
    fraudDetection: true,
    pciCompliant: true
  }
}
