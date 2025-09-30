import { NextRequest, NextResponse } from 'next/server'
import { validateURL, validateRedirectURL, checkOpenRedirect } from '@/lib/url-validation'
import { withAPIRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Input validation schema
const urlValidationSchema = z.object({
  url: z.string().min(1, 'URL is required').max(2048, 'URL too long'),
  type: z.enum(['general', 'redirect', 'callback', 'file']).default('general'),
  baseUrl: z.string().url().optional(),
})

export const POST = withAPIRateLimit(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = urlValidationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        },
        { status: 400 }
      )
    }
    
    const { url, type, baseUrl } = validation.data
    
    let result
    
    switch (type) {
      case 'redirect':
        if (!baseUrl) {
          return NextResponse.json(
            { error: 'baseUrl is required for redirect validation' },
            { status: 400 }
          )
        }
        result = validateRedirectURL(url, baseUrl)
        break
        
      case 'callback':
        // For OAuth callbacks - more permissive but still secure
        result = validateURL(url, {
          allowExternal: true,
          requireHttps: process.env.NODE_ENV === 'production',
        })
        break
        
      case 'file':
        // For file URLs - check file extensions
        result = validateURL(url, {
          allowExternal: true,
          maxLength: 1024,
        })
        break
        
      default:
        // General URL validation
        result = validateURL(url, {
          allowRelative: true,
          allowExternal: false,
        })
    }
    
    // Check for open redirect vulnerability
    const openRedirectCheck = checkOpenRedirect(url)
    
    return NextResponse.json({
      isValid: result.isValid,
      sanitizedUrl: result.sanitizedUrl,
      errors: result.errors,
      warnings: result.warnings,
      security: {
        isOpenRedirectVulnerable: openRedirectCheck.isVulnerable,
        openRedirectReason: openRedirectCheck.reason,
      },
    })
    
  } catch (error) {
    console.error('URL validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// GET endpoint for quick URL checks via query parameters
export const GET = withAPIRateLimit(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const type = searchParams.get('type') || 'general'
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }
    
    // Basic validation for GET requests
    const result = validateURL(decodeURIComponent(url), {
      allowRelative: true,
      allowExternal: type === 'external',
    })
    
    return NextResponse.json({
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings,
    })
    
  } catch (error) {
    console.error('URL validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
