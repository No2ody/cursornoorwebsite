// URL validation and sanitization utilities
import { NextRequest } from 'next/server'

// Allowed domains for redirects
const ALLOWED_DOMAINS = [
  'localhost',
  'nooraltayseer.com',
  'www.nooraltayseer.com',
  'admin.nooraltayseer.com',
  'api.nooraltayseer.com',
] as const

// Allowed protocols
const ALLOWED_PROTOCOLS = ['http:', 'https:'] as const

// Dangerous URL patterns to block
const DANGEROUS_PATTERNS = [
  /javascript:/i,
  /data:/i,
  /vbscript:/i,
  /file:/i,
  /ftp:/i,
  /%00/i, // Null byte
  /%0a/i, // Line feed
  /%0d/i, // Carriage return
  /\.\./i, // Directory traversal
  /\/\//i, // Protocol-relative URLs in certain contexts
] as const

// Common phishing/malicious domains (basic list)
const BLOCKED_DOMAINS = [
  'bit.ly',
  'tinyurl.com',
  'short.link',
  'malicious-site.com',
  // Add more as needed
] as const

export interface URLValidationResult {
  isValid: boolean
  sanitizedUrl?: string
  errors: string[]
  warnings: string[]
}

export interface URLValidationOptions {
  allowRelative?: boolean
  allowExternal?: boolean
  allowedDomains?: string[]
  blockedDomains?: string[]
  maxLength?: number
  requireHttps?: boolean
}

// Validate and sanitize URLs
export function validateURL(
  url: string,
  options: URLValidationOptions = {}
): URLValidationResult {
  const {
    allowRelative = true,
    allowExternal = false,
    allowedDomains = ALLOWED_DOMAINS,
    blockedDomains = BLOCKED_DOMAINS,
    maxLength = 2048,
    requireHttps = process.env.NODE_ENV === 'production',
  } = options

  const errors: string[] = []
  const warnings: string[] = []

  // Basic validation
  if (!url || typeof url !== 'string') {
    errors.push('URL is required and must be a string')
    return { isValid: false, errors, warnings }
  }

  // Length validation
  if (url.length > maxLength) {
    errors.push(`URL exceeds maximum length of ${maxLength} characters`)
    return { isValid: false, errors, warnings }
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(url)) {
      errors.push('URL contains potentially dangerous content')
      return { isValid: false, errors, warnings }
    }
  }

  // Handle relative URLs
  if (url.startsWith('/')) {
    if (!allowRelative) {
      errors.push('Relative URLs are not allowed')
      return { isValid: false, errors, warnings }
    }
    
    // Sanitize relative URL
    const sanitizedUrl = sanitizeRelativeURL(url)
    return {
      isValid: true,
      sanitizedUrl,
      errors,
      warnings,
    }
  }

  // Parse absolute URL
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    errors.push('Invalid URL format')
    return { isValid: false, errors, warnings }
  }

  // Protocol validation
  if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol as typeof ALLOWED_PROTOCOLS[number])) {
    errors.push(`Protocol '${parsedUrl.protocol}' is not allowed`)
    return { isValid: false, errors, warnings }
  }

  // HTTPS requirement
  if (requireHttps && parsedUrl.protocol !== 'https:') {
    errors.push('HTTPS is required')
    return { isValid: false, errors, warnings }
  }

  // Domain validation
  const hostname = parsedUrl.hostname.toLowerCase()

  // Check blocked domains
  if (blockedDomains.some(domain => hostname.includes(domain.toLowerCase()))) {
    errors.push('Domain is blocked')
    return { isValid: false, errors, warnings }
  }

  // Check allowed domains for external URLs
  if (!allowExternal) {
    const isAllowedDomain = allowedDomains.some(domain => {
      const normalizedDomain = domain.toLowerCase()
      return hostname === normalizedDomain || hostname.endsWith(`.${normalizedDomain}`)
    })

    if (!isAllowedDomain) {
      errors.push('External domains are not allowed')
      return { isValid: false, errors, warnings }
    }
  }

  // Additional security checks
  if (parsedUrl.username || parsedUrl.password) {
    warnings.push('URL contains authentication credentials')
  }

  if (parsedUrl.port && !['80', '443', '3000', '8080'].includes(parsedUrl.port)) {
    warnings.push('URL uses non-standard port')
  }

  // Sanitize the URL
  const sanitizedUrl = sanitizeAbsoluteURL(parsedUrl)

  return {
    isValid: true,
    sanitizedUrl,
    errors,
    warnings,
  }
}

// Sanitize relative URLs
function sanitizeRelativeURL(url: string): string {
  // Remove dangerous characters and normalize
  let sanitized = url
    .replace(/[<>"']/g, '') // Remove HTML injection chars
    .replace(/\\/g, '/') // Normalize path separators
    .replace(/\/+/g, '/') // Remove duplicate slashes
    .replace(/\/\.\//g, '/') // Remove current directory references
  
  // Remove directory traversal attempts
  while (sanitized.includes('../')) {
    sanitized = sanitized.replace(/\/[^/]*\/\.\.\//g, '/')
  }
  
  // Ensure it starts with /
  if (!sanitized.startsWith('/')) {
    sanitized = '/' + sanitized
  }
  
  return sanitized
}

// Sanitize absolute URLs
function sanitizeAbsoluteURL(parsedUrl: URL): string {
  // Remove credentials for security
  parsedUrl.username = ''
  parsedUrl.password = ''
  
  // Sanitize pathname
  parsedUrl.pathname = sanitizeRelativeURL(parsedUrl.pathname)
  
  // Remove dangerous search parameters
  const searchParams = new URLSearchParams(parsedUrl.search)
  const dangerousParams = ['javascript', 'script', 'eval', 'onload', 'onerror']
  
  dangerousParams.forEach(param => {
    searchParams.delete(param)
  })
  
  parsedUrl.search = searchParams.toString()
  
  return parsedUrl.toString()
}

// Validate redirect URL specifically for authentication
export function validateRedirectURL(
  redirectUrl: string,
  baseUrl: string
): URLValidationResult {
  // Special validation for auth redirects
  const result = validateURL(redirectUrl, {
    allowRelative: true,
    allowExternal: false,
    requireHttps: process.env.NODE_ENV === 'production',
  })

  if (!result.isValid) {
    return result
  }

  // Additional checks for auth redirects
  if (result.sanitizedUrl) {
    // Ensure redirect is within our application
    if (result.sanitizedUrl.startsWith('/')) {
      // Relative URL - safe
      return result
    } else {
      // Absolute URL - check if it's our domain
      try {
        const redirectURL = new URL(result.sanitizedUrl)
        const baseURL = new URL(baseUrl)
        
        if (redirectURL.origin !== baseURL.origin) {
          return {
            isValid: false,
            errors: ['Redirect URL must be within the same origin'],
            warnings: result.warnings,
          }
        }
      } catch {
        return {
          isValid: false,
          errors: ['Invalid redirect URL format'],
          warnings: result.warnings,
        }
      }
    }
  }

  return result
}

// Extract and validate URLs from request
export function extractURLFromRequest(
  request: NextRequest,
  paramName: string = 'redirect'
): URLValidationResult {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get(paramName)
  
  if (!url) {
    return {
      isValid: false,
      errors: [`Missing ${paramName} parameter`],
      warnings: [],
    }
  }
  
  return validateURL(decodeURIComponent(url))
}

// Safe redirect helper
export function createSafeRedirectURL(
  targetUrl: string,
  fallbackUrl: string = '/'
): string {
  const validation = validateURL(targetUrl, {
    allowRelative: true,
    allowExternal: false,
  })
  
  if (validation.isValid && validation.sanitizedUrl) {
    return validation.sanitizedUrl
  }
  
  return fallbackUrl
}

// Validate callback URLs for OAuth
export function validateOAuthCallbackURL(
  callbackUrl: string,
  allowedCallbacks: string[]
): URLValidationResult {
  const result = validateURL(callbackUrl, {
    allowRelative: false,
    allowExternal: true,
    requireHttps: process.env.NODE_ENV === 'production',
  })
  
  if (!result.isValid) {
    return result
  }
  
  // Check if callback URL is in allowed list
  const isAllowed = allowedCallbacks.some(allowed => {
    try {
      const allowedURL = new URL(allowed)
      const callbackURL = new URL(callbackUrl)
      
      return allowedURL.origin === callbackURL.origin &&
             callbackURL.pathname.startsWith(allowedURL.pathname)
    } catch {
      return false
    }
  })
  
  if (!isAllowed) {
    return {
      isValid: false,
      errors: ['Callback URL is not in the allowed list'],
      warnings: result.warnings,
    }
  }
  
  return result
}

// Check for open redirect vulnerabilities
export function checkOpenRedirect(
  url: string,
  trustedDomains: readonly string[] = ALLOWED_DOMAINS
): {
  isVulnerable: boolean
  reason?: string
} {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname.toLowerCase()
    
    // Check if it's a trusted domain
    const isTrusted = trustedDomains.some(domain => {
      const normalizedDomain = domain.toLowerCase()
      return hostname === normalizedDomain || hostname.endsWith(`.${normalizedDomain}`)
    })
    
    if (!isTrusted) {
      return {
        isVulnerable: true,
        reason: `Redirect to untrusted domain: ${hostname}`,
      }
    }
    
    return { isVulnerable: false }
  } catch {
    // If URL parsing fails, it's potentially dangerous
    return {
      isVulnerable: true,
      reason: 'Invalid URL format',
    }
  }
}

// URL encoding/decoding helpers
export function safeDecodeURIComponent(str: string): string {
  try {
    return decodeURIComponent(str)
  } catch {
    return str // Return original if decoding fails
  }
}

export function safeEncodeURIComponent(str: string): string {
  try {
    return encodeURIComponent(str)
  } catch {
    return str // Return original if encoding fails
  }
}

// Validate file upload URLs
export function validateFileUploadURL(
  url: string,
  allowedExtensions: string[] = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
): URLValidationResult {
  const result = validateURL(url, {
    allowRelative: false,
    allowExternal: true,
    maxLength: 1024,
  })
  
  if (!result.isValid) {
    return result
  }
  
  // Check file extension
  const pathname = new URL(url).pathname.toLowerCase()
  const hasAllowedExtension = allowedExtensions.some(ext => pathname.endsWith(ext))
  
  if (!hasAllowedExtension) {
    return {
      isValid: false,
      errors: ['File type not allowed'],
      warnings: result.warnings,
    }
  }
  
  return result
}

// Export types (already exported as interfaces above)
