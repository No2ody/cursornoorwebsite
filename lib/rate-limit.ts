// Advanced rate limiting system for API endpoints
import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
  keyGenerator?: (request: NextRequest) => string // Custom key generator
  onLimitReached?: (request: NextRequest) => NextResponse // Custom response when limit reached
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
    firstRequest: number
  }
}

// In-memory store (for production, use Redis or database)
const rateLimitStore: RateLimitStore = {}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key]
    }
  })
}, 5 * 60 * 1000)

// Default rate limit configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints - stricter limits
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
  
  // Password reset - very strict
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 attempts per hour
  },
  
  // Search endpoints - moderate limits
  SEARCH: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
  },
  
  // API endpoints - standard limits
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  },
  
  // File upload - strict limits
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 uploads per hour
  },
  
  // Admin endpoints - moderate limits
  ADMIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200, // 200 requests per 15 minutes
  },
  
  // Public endpoints - generous limits
  PUBLIC: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 300, // 300 requests per 15 minutes
  },
  
  // Payment endpoints - strict limits
  PAYMENT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 payment attempts per hour
  },
} as const

// Get client identifier for rate limiting
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  let clientIP = 'unknown'
  
  if (forwardedFor) {
    clientIP = forwardedFor.split(',')[0].trim()
  } else if (realIP) {
    clientIP = realIP
  } else if (cfConnectingIP) {
    clientIP = cfConnectingIP
  }
  
  // For authenticated requests, also include user agent for better identification
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const userAgentHash = Buffer.from(userAgent).toString('base64').substring(0, 10)
  
  return `${clientIP}:${userAgentHash}`
}

// Main rate limiting function
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}> {
  const now = Date.now()
  const key = config.keyGenerator ? config.keyGenerator(request) : getClientIdentifier(request)
  
  // Get or create rate limit entry
  let entry = rateLimitStore[key]
  
  if (!entry || entry.resetTime <= now) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      firstRequest: now,
    }
    rateLimitStore[key] = entry
  }
  
  // Increment request count
  entry.count++
  
  const remaining = Math.max(0, config.maxRequests - entry.count)
  const isLimited = entry.count > config.maxRequests
  
  return {
    success: !isLimited,
    limit: config.maxRequests,
    remaining,
    reset: entry.resetTime,
    retryAfter: isLimited ? Math.ceil((entry.resetTime - now) / 1000) : undefined,
  }
}

// Rate limiting middleware factory
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const result = await rateLimit(request, config)
    
    if (!result.success) {
      const response = config.onLimitReached 
        ? config.onLimitReached(request)
        : NextResponse.json(
            {
              error: 'Too Many Requests',
              message: 'Rate limit exceeded. Please try again later.',
              retryAfter: result.retryAfter,
            },
            { status: 429 }
          )
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', result.limit.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.reset.toString())
      
      if (result.retryAfter) {
        response.headers.set('Retry-After', result.retryAfter.toString())
      }
      
      return response
    }
    
    return null // Continue to next middleware/handler
  }
}

// Utility function to add rate limit headers to successful responses
export function addRateLimitHeaders(
  response: NextResponse,
  result: {
    limit: number
    remaining: number
    reset: number
  }
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.reset.toString())
  return response
}

// Enhanced rate limiting with user-specific limits
export async function rateLimitWithUser(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}> {
  // If user is authenticated, use user-specific rate limiting
  if (userId) {
    const userConfig = {
      ...config,
      keyGenerator: () => `user:${userId}`,
      maxRequests: Math.floor(config.maxRequests * 1.5), // 50% higher limit for authenticated users
    }
    return rateLimit(request, userConfig)
  }
  
  return rateLimit(request, config)
}

// Suspicious activity detection
export function detectSuspiciousActivity(
  request: NextRequest,
  rateLimitResult: { count: number; firstRequest: number }
): {
  isSuspicious: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  const now = Date.now()
  const requestRate = rateLimitResult.count / ((now - rateLimitResult.firstRequest) / 1000)
  
  // Check for rapid requests (more than 10 requests per second)
  if (requestRate > 10) {
    reasons.push('Extremely high request rate')
  }
  
  // Check for missing or suspicious user agent
  const userAgent = request.headers.get('user-agent')
  if (!userAgent || userAgent.length < 10) {
    reasons.push('Missing or suspicious user agent')
  }
  
  // Check for common bot patterns
  if (userAgent && /bot|crawler|spider|scraper/i.test(userAgent)) {
    reasons.push('Bot-like user agent detected')
  }
  
  // Check for suspicious referer patterns
  const referer = request.headers.get('referer')
  if (referer && !/^https?:\/\/(localhost|.*\.nooraltayseer\.com)/i.test(referer)) {
    reasons.push('Suspicious referer header')
  }
  
  return {
    isSuspicious: reasons.length > 0,
    reasons,
  }
}

// Rate limiting decorator for API handlers
export function withRateLimit<T extends unknown[]>(
  config: RateLimitConfig,
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Apply rate limiting
    const rateLimitResponse = await createRateLimitMiddleware(config)(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    
    // Get rate limit info for headers
    const rateLimitResult = await rateLimit(request, { ...config, maxRequests: config.maxRequests + 1 })
    
    // Call the original handler
    const response = await handler(request, ...args)
    
    // Add rate limit headers to successful response
    return addRateLimitHeaders(response, rateLimitResult)
  }
}

// Preset rate limiting decorators
export const withAuthRateLimit = <T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) => withRateLimit(RATE_LIMIT_CONFIGS.AUTH, handler)

export const withAPIRateLimit = <T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) => withRateLimit(RATE_LIMIT_CONFIGS.API, handler)

export const withSearchRateLimit = <T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) => withRateLimit(RATE_LIMIT_CONFIGS.SEARCH, handler)

export const withPaymentRateLimit = <T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) => withRateLimit(RATE_LIMIT_CONFIGS.PAYMENT, handler)

export const withAdminRateLimit = <T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) => withRateLimit(RATE_LIMIT_CONFIGS.ADMIN, handler)

export const withPublicRateLimit = <T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) => withRateLimit(RATE_LIMIT_CONFIGS.PUBLIC, handler)

// Global rate limiting statistics
export function getRateLimitStats(): {
  totalClients: number
  activeClients: number
  totalRequests: number
} {
  const now = Date.now()
  let totalRequests = 0
  let activeClients = 0
  
  Object.values(rateLimitStore).forEach(entry => {
    totalRequests += entry.count
    if (entry.resetTime > now) {
      activeClients++
    }
  })
  
  return {
    totalClients: Object.keys(rateLimitStore).length,
    activeClients,
    totalRequests,
  }
}

// Clear rate limit for specific client (admin function)
export function clearRateLimit(clientId: string): boolean {
  if (rateLimitStore[clientId]) {
    delete rateLimitStore[clientId]
    return true
  }
  return false
}

// Export types for use in other files
export type { RateLimitConfig, RateLimitStore }
