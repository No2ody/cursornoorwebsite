// Comprehensive security headers configuration
import { NextResponse } from 'next/server'

// Content Security Policy configuration
export const CSP_CONFIG = {
  // Allow self and specific trusted domains
  'default-src': ["'self'"],
  
  // Scripts - allow self, inline scripts with nonce, and trusted CDNs
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Next.js in development
    "'unsafe-eval'", // Required for Next.js in development
    'https://js.stripe.com',
    'https://checkout.stripe.com',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://connect.facebook.net',
    'https://www.facebook.com',
  ],
  
  // Stylesheets - allow self, inline styles, and trusted CDNs
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components and CSS-in-JS
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net',
  ],
  
  // Images - allow self, data URLs, and trusted domains
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'https://images.unsplash.com',
    'https://res.cloudinary.com',
    'https://lh3.googleusercontent.com', // Google profile images
    'https://avatars.githubusercontent.com', // GitHub profile images
    'https://www.google-analytics.com',
    'https://www.facebook.com',
  ],
  
  // Fonts - allow self and Google Fonts
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:',
  ],
  
  // Connect - API calls and WebSocket connections
  'connect-src': [
    "'self'",
    'https://api.stripe.com',
    'https://checkout.stripe.com',
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://www.googletagmanager.com',
    'https://graph.facebook.com',
    'https://connect.facebook.net',
    process.env.NODE_ENV === 'development' ? 'ws://localhost:*' : '',
    process.env.NODE_ENV === 'development' ? 'http://localhost:*' : '',
  ].filter(Boolean),
  
  // Frames - restrict iframe embedding
  'frame-src': [
    "'self'",
    'https://js.stripe.com',
    'https://checkout.stripe.com',
    'https://www.google.com', // For reCAPTCHA
    'https://www.facebook.com',
  ],
  
  // Objects - restrict object, embed, and applet
  'object-src': ["'none'"],
  
  // Media - allow self and trusted domains
  'media-src': [
    "'self'",
    'data:',
    'blob:',
  ],
  
  // Workers - allow self
  'worker-src': [
    "'self'",
    'blob:',
  ],
  
  // Child sources - for web workers and nested contexts
  'child-src': [
    "'self'",
    'blob:',
  ],
  
  // Form actions - restrict form submissions
  'form-action': [
    "'self'",
    'https://checkout.stripe.com',
  ],
  
  // Frame ancestors - prevent clickjacking
  'frame-ancestors': ["'none'"],
  
  // Base URI - restrict base tag
  'base-uri': ["'self'"],
  
  // Upgrade insecure requests in production
  ...(process.env.NODE_ENV === 'production' ? { 'upgrade-insecure-requests': [] } : {}),
}

// Generate CSP header string
export function generateCSPHeader(): string {
  return Object.entries(CSP_CONFIG)
    .map(([directive, sources]) => {
      if (Array.isArray(sources) && sources.length > 0) {
        return `${directive} ${sources.join(' ')}`
      } else if (sources.length === 0) {
        return directive // For directives without sources like upgrade-insecure-requests
      }
      return ''
    })
    .filter(Boolean)
    .join('; ')
}

// Comprehensive security headers
export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': generateCSPHeader(),
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer Policy - control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy - control browser features
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=(self)',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=(self)',
    'encrypted-media=(self)',
    'fullscreen=(self)',
    'picture-in-picture=(self)',
  ].join(', '),
  
  // Strict Transport Security (HSTS) - only in production
  ...(process.env.NODE_ENV === 'production' ? {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  } : {}),
  
  // Cross-Origin Policies
  'Cross-Origin-Embedder-Policy': 'credentialless',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site',
  
  // Prevent DNS prefetching for privacy
  'X-DNS-Prefetch-Control': 'off',
  
  // Control download behavior
  'X-Download-Options': 'noopen',
  
  // Prevent MIME type confusion
  'X-Permitted-Cross-Domain-Policies': 'none',
  
  // Server information hiding
  'Server': 'Noor AlTayseer',
  
  // Cache control for sensitive pages
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
} as const

// Security headers for API routes
export const API_SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Resource-Policy': 'same-site',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
} as const

// Security headers for static assets
export const STATIC_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Cache-Control': 'public, max-age=31536000, immutable',
} as const

// Apply security headers to response
export function applySecurityHeaders(
  response: NextResponse,
  headerType: 'default' | 'api' | 'static' = 'default'
): NextResponse {
  let headers: Record<string, string>
  
  switch (headerType) {
    case 'api':
      headers = API_SECURITY_HEADERS
      break
    case 'static':
      headers = STATIC_SECURITY_HEADERS
      break
    default:
      headers = SECURITY_HEADERS
  }
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// Create a response with security headers
export function createSecureResponse(
  body?: BodyInit | null,
  init?: ResponseInit,
  headerType: 'default' | 'api' | 'static' = 'default'
): NextResponse {
  const response = new NextResponse(body, init)
  return applySecurityHeaders(response, headerType)
}

// Nonce generation for CSP
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

// CSP with nonce support
export function generateCSPWithNonce(nonce: string): string {
  const cspWithNonce = { ...CSP_CONFIG }
  
  // Add nonce to script-src
  cspWithNonce['script-src'] = [
    ...cspWithNonce['script-src'],
    `'nonce-${nonce}'`
  ]
  
  // Add nonce to style-src
  cspWithNonce['style-src'] = [
    ...cspWithNonce['style-src'],
    `'nonce-${nonce}'`
  ]
  
  return Object.entries(cspWithNonce)
    .map(([directive, sources]) => {
      if (Array.isArray(sources) && sources.length > 0) {
        return `${directive} ${sources.join(' ')}`
      } else if (sources.length === 0) {
        return directive
      }
      return ''
    })
    .filter(Boolean)
    .join('; ')
}

// Security headers middleware for specific routes
export function createSecurityMiddleware(
  options: {
    headerType?: 'default' | 'api' | 'static'
    customHeaders?: Record<string, string>
    enableNonce?: boolean
  } = {}
) {
  return (response: NextResponse): NextResponse => {
    // Apply base security headers
    applySecurityHeaders(response, options.headerType)
    
    // Apply custom headers
    if (options.customHeaders) {
      Object.entries(options.customHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }
    
    // Add nonce if enabled
    if (options.enableNonce) {
      const nonce = generateNonce()
      response.headers.set('Content-Security-Policy', generateCSPWithNonce(nonce))
      response.headers.set('X-Nonce', nonce) // For use in templates
    }
    
    return response
  }
}

// Validate CSP report (for CSP violation reporting)
export interface CSPReport {
  'csp-report': {
    'document-uri': string
    'referrer': string
    'violated-directive': string
    'effective-directive': string
    'original-policy': string
    'disposition': string
    'blocked-uri': string
    'line-number': number
    'column-number': number
    'source-file': string
    'status-code': number
    'script-sample': string
  }
}

// Log CSP violations for monitoring
export function logCSPViolation(report: CSPReport): void {
  const violation = report['csp-report']
  
  console.warn('CSP Violation:', {
    directive: violation['violated-directive'],
    blockedUri: violation['blocked-uri'],
    documentUri: violation['document-uri'],
    sourceFile: violation['source-file'],
    lineNumber: violation['line-number'],
    columnNumber: violation['column-number'],
  })
  
  // In production, you might want to send this to a monitoring service
  // like Sentry, LogRocket, or your own logging endpoint
}

// Export types for TypeScript
export type SecurityHeaderType = 'default' | 'api' | 'static'
export type SecurityHeaders = typeof SECURITY_HEADERS
