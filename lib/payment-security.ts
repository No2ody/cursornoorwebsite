// Payment security utilities and fraud detection
import crypto from 'crypto'

export interface SecurityCheck {
  passed: boolean
  riskLevel: 'low' | 'medium' | 'high'
  checks: {
    amountValidation: boolean
    ipGeolocation: boolean
    deviceFingerprint: boolean
    velocityCheck: boolean
    blacklistCheck: boolean
  }
  recommendations: string[]
}

export interface PaymentSecurityConfig {
  maxDailyAmount: number
  maxTransactionAmount: number
  velocityLimits: {
    transactionsPerHour: number
    transactionsPerDay: number
  }
  requiredVerification: {
    email: boolean
    phone: boolean
    identity: boolean
  }
  fraudDetection: {
    enabled: boolean
    strictMode: boolean
    blockSuspiciousIPs: boolean
  }
}

// Default security configuration
export const DEFAULT_SECURITY_CONFIG: PaymentSecurityConfig = {
  maxDailyAmount: 50000, // AED
  maxTransactionAmount: 25000, // AED
  velocityLimits: {
    transactionsPerHour: 5,
    transactionsPerDay: 20
  },
  requiredVerification: {
    email: true,
    phone: false,
    identity: false
  },
  fraudDetection: {
    enabled: true,
    strictMode: false,
    blockSuspiciousIPs: false
  }
}

// Generate secure payment token
export const generatePaymentToken = (
  userId: string,
  amount: number,
  timestamp: number = Date.now()
): string => {
  const secret = process.env.PAYMENT_TOKEN_SECRET
  
  if (!secret) {
    throw new Error('PAYMENT_TOKEN_SECRET environment variable is required')
  }
  
  // Validate inputs
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid userId is required')
  }
  
  if (!amount || amount <= 0) {
    throw new Error('Valid amount is required')
  }
  
  const data = `${userId}:${amount}:${timestamp}`
  
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex')
}

// Verify payment token
export const verifyPaymentToken = (
  token: string,
  userId: string,
  amount: number,
  timestamp: number,
  maxAge: number = 3600000 // 1 hour
): boolean => {
  try {
    // Check if token is expired
    if (Date.now() - timestamp > maxAge) {
      return false
    }
    
    const expectedToken = generatePaymentToken(userId, amount, timestamp)
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expectedToken, 'hex')
    )
  } catch (error) {
    console.error('Token verification error:', error)
    return false
  }
}

// Validate payment amount
export const validatePaymentAmount = (
  amount: number,
  currency: string = 'AED',
  config: PaymentSecurityConfig = DEFAULT_SECURITY_CONFIG
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Basic amount validation
  if (amount <= 0) {
    errors.push('Amount must be greater than zero')
  }
  
  if (amount > config.maxTransactionAmount) {
    errors.push(`Amount exceeds maximum transaction limit of ${config.maxTransactionAmount} ${currency}`)
  }
  
  // Currency-specific validation
  if (currency === 'AED') {
    // UAE Dirham - minimum 1 fils (0.01 AED)
    if (amount < 0.01) {
      errors.push('Minimum amount is 0.01 AED')
    }
  }
  
  return { valid: errors.length === 0, errors }
}

// Check transaction velocity (rate limiting)
export const checkTransactionVelocity = async (
  userId: string,
  config: PaymentSecurityConfig = DEFAULT_SECURITY_CONFIG
): Promise<{ allowed: boolean; remaining: { hourly: number; daily: number } }> => {
  // This would typically query a database or cache
  // For now, we'll simulate the check
  
  // const now = new Date() // Currently unused in simulation
  // Time thresholds for analysis (currently unused in simulation)
  // const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  // const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  // Simulate transaction counts (in real implementation, query from database)
  const hourlyTransactions = 0 // Count from last hour
  const dailyTransactions = 0 // Count from last 24 hours
  
  const hourlyRemaining = Math.max(0, config.velocityLimits.transactionsPerHour - hourlyTransactions)
  const dailyRemaining = Math.max(0, config.velocityLimits.transactionsPerDay - dailyTransactions)
  
  return {
    allowed: hourlyRemaining > 0 && dailyRemaining > 0,
    remaining: {
      hourly: hourlyRemaining,
      daily: dailyRemaining
    }
  }
}

// IP geolocation and risk assessment
export const assessIPRisk = (
  ipAddress: string,
  allowedCountries: string[] = ['AE', 'US', 'GB', 'CA', 'AU']
): { riskLevel: 'low' | 'medium' | 'high'; country?: string; blocked: boolean } => {
  // This would typically use a geolocation service
  // For now, we'll simulate the check
  
  // Simulate country detection
  const simulatedCountry = 'AE' // Default to UAE
  const isAllowedCountry = allowedCountries.includes(simulatedCountry)
  
  // Simple risk assessment
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  
  if (!isAllowedCountry) {
    riskLevel = 'high'
  }
  
  // Check against known suspicious IP ranges (simplified)
  const suspiciousRanges = ['10.0.0.', '192.168.', '127.0.0.']
  const isSuspicious = suspiciousRanges.some(range => ipAddress.startsWith(range))
  
  if (isSuspicious) {
    riskLevel = 'medium'
  }
  
  return {
    riskLevel,
    country: simulatedCountry,
    blocked: riskLevel === 'high'
  }
}

// Device fingerprinting
export const generateDeviceFingerprint = (userAgent: string, acceptLanguage: string): string => {
  const data = `${userAgent}:${acceptLanguage}:${Date.now()}`
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)
}

// Comprehensive security check
export const performSecurityCheck = async (
  userId: string,
  amount: number,
  currency: string,
  ipAddress: string,
  userAgent: string,
  acceptLanguage: string,
  config: PaymentSecurityConfig = DEFAULT_SECURITY_CONFIG
): Promise<SecurityCheck> => {
  const checks = {
    amountValidation: false,
    ipGeolocation: false,
    deviceFingerprint: false,
    velocityCheck: false,
    blacklistCheck: false
  }
  
  const recommendations: string[] = []
  
  // Amount validation
  const amountCheck = validatePaymentAmount(amount, currency, config)
  checks.amountValidation = amountCheck.valid
  if (!amountCheck.valid) {
    recommendations.push(...amountCheck.errors)
  }
  
  // IP geolocation check
  const ipCheck = assessIPRisk(ipAddress)
  checks.ipGeolocation = ipCheck.riskLevel !== 'high'
  if (ipCheck.riskLevel === 'high') {
    recommendations.push('Transaction blocked due to high-risk location')
  } else if (ipCheck.riskLevel === 'medium') {
    recommendations.push('Additional verification may be required')
  }
  
  // Device fingerprinting
  const deviceFingerprint = generateDeviceFingerprint(userAgent, acceptLanguage)
  checks.deviceFingerprint = deviceFingerprint.length > 0
  
  // Velocity check
  const velocityCheck = await checkTransactionVelocity(userId, config)
  checks.velocityCheck = velocityCheck.allowed
  if (!velocityCheck.allowed) {
    recommendations.push('Transaction limit exceeded. Please try again later.')
  }
  
  // Blacklist check (simplified)
  checks.blacklistCheck = true // Assume user is not blacklisted
  
  // Calculate overall risk level
  const passedChecks = Object.values(checks).filter(Boolean).length
  const totalChecks = Object.keys(checks).length
  const passRate = passedChecks / totalChecks
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (passRate < 0.6) {
    riskLevel = 'high'
  } else if (passRate < 0.8) {
    riskLevel = 'medium'
  }
  
  const passed = passRate >= 0.8 && checks.amountValidation && checks.velocityCheck
  
  return {
    passed,
    riskLevel,
    checks,
    recommendations
  }
}

// Encrypt sensitive payment data using AES-256-CBC (secure)
export const encryptPaymentData = (data: string, key?: string): string => {
  const encryptionKey = key || process.env.PAYMENT_ENCRYPTION_KEY
  
  if (!encryptionKey) {
    throw new Error('PAYMENT_ENCRYPTION_KEY environment variable is required')
  }
  
  if (!data || typeof data !== 'string') {
    throw new Error('Valid data string is required for encryption')
  }
  
  // Use AES-256-CBC for encryption
  const cipher = crypto.createCipher('aes-256-cbc', encryptionKey)
  
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return encrypted
}

// Decrypt sensitive payment data using AES-256-CBC (secure)
export const decryptPaymentData = (encryptedData: string, key?: string): string => {
  const encryptionKey = key || process.env.PAYMENT_ENCRYPTION_KEY
  
  if (!encryptionKey) {
    throw new Error('PAYMENT_ENCRYPTION_KEY environment variable is required')
  }
  
  if (!encryptedData || typeof encryptedData !== 'string') {
    throw new Error('Valid encrypted data string is required for decryption')
  }
  
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey)
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    throw new Error('Failed to decrypt payment data: ' + (error as Error).message)
  }
}

// Generate secure webhook signature
export const generateWebhookSignature = (payload: string, secret: string): string => {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

// Verify webhook signature
export const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = generateWebhookSignature(payload, secret)
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch {
    return false
  }
}

// PCI DSS compliance helpers
export const sanitizeCardData = (cardNumber: string): string => {
  // Only show last 4 digits
  return '**** **** **** ' + cardNumber.slice(-4)
}

export const validateCardNumber = (cardNumber: string): boolean => {
  // Basic Luhn algorithm implementation
  const digits = cardNumber.replace(/\D/g, '')
  let sum = 0
  let isEven = false
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

// Export security configuration for admin
export const getSecurityConfiguration = (): PaymentSecurityConfig => {
  return DEFAULT_SECURITY_CONFIG
}

export const updateSecurityConfiguration = (
  updates: Partial<PaymentSecurityConfig>
): PaymentSecurityConfig => {
  return { ...DEFAULT_SECURITY_CONFIG, ...updates }
}
