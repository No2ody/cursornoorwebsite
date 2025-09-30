// Authorization utilities for API routes
import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export interface AuthContext {
  user: {
    id: string
    email: string
    role: string
    name?: string
  }
}

// Role-based permissions
export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const

export type Role = keyof typeof ROLES

// Permission levels
export const PERMISSIONS = {
  READ_OWN: 'read_own',
  WRITE_OWN: 'write_own',
  DELETE_OWN: 'delete_own',
  READ_ALL: 'read_all',
  WRITE_ALL: 'write_all',
  DELETE_ALL: 'delete_all',
  ADMIN_PANEL: 'admin_panel',
  MANAGE_USERS: 'manage_users',
  MANAGE_ORDERS: 'manage_orders',
  MANAGE_PRODUCTS: 'manage_products',
} as const

export type Permission = keyof typeof PERMISSIONS

// Role permissions mapping
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [ROLES.USER]: ['READ_OWN', 'WRITE_OWN', 'DELETE_OWN'],
  [ROLES.ADMIN]: [
    'READ_OWN', 'WRITE_OWN', 'DELETE_OWN',
    'READ_ALL', 'WRITE_ALL', 'DELETE_ALL',
    'ADMIN_PANEL', 'MANAGE_ORDERS', 'MANAGE_PRODUCTS'
  ],
  [ROLES.SUPER_ADMIN]: [
    'READ_OWN', 'WRITE_OWN', 'DELETE_OWN',
    'READ_ALL', 'WRITE_ALL', 'DELETE_ALL',
    'ADMIN_PANEL', 'MANAGE_USERS', 'MANAGE_ORDERS', 'MANAGE_PRODUCTS'
  ],
}

// Get authenticated user context
export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return null
    }
    
    return {
      user: {
        id: session.user.id,
        email: session.user.email || '',
        role: session.user.role || ROLES.USER,
        name: session.user.name || undefined,
      }
    }
  } catch (error) {
    console.error('Auth context error:', error)
    return null
  }
}

// Check if user has specific permission
export function hasPermission(userRole: string, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.includes(permission)
}

// Require authentication middleware
export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const context = await getAuthContext()
  
  if (!context) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  return context
}

// Require specific role middleware
export async function requireRole(requiredRole: Role): Promise<AuthContext | NextResponse> {
  const context = await getAuthContext()
  
  if (!context) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  if (context.user.role !== requiredRole && context.user.role !== ROLES.SUPER_ADMIN) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  
  return context
}

// Require specific permission middleware
export async function requirePermission(permission: Permission): Promise<AuthContext | NextResponse> {
  const context = await getAuthContext()
  
  if (!context) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  if (!hasPermission(context.user.role, permission)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  
  return context
}

// Check if user owns a resource
export async function requireResourceOwnership(
  resourceType: 'order' | 'address' | 'wishlist' | 'review',
  resourceId: string,
  userId?: string
): Promise<boolean> {
  try {
    if (!userId) {
      const context = await getAuthContext()
      if (!context) return false
      userId = context.user.id
    }
    
    let resource = null
    
    switch (resourceType) {
      case 'order':
        resource = await prisma.order.findFirst({
          where: { id: resourceId, userId },
          select: { id: true }
        })
        break
        
      case 'address':
        resource = await prisma.address.findFirst({
          where: { id: resourceId, userId },
          select: { id: true }
        })
        break
        
      case 'wishlist':
        resource = await prisma.wishlistItem.findFirst({
          where: { id: resourceId, userId },
          select: { id: true }
        })
        break
        
      case 'review':
        resource = await prisma.review.findFirst({
          where: { id: resourceId, userId },
          select: { id: true }
        })
        break
        
      default:
        return false
    }
    
    return resource !== null
  } catch (error) {
    console.error('Resource ownership check error:', error)
    return false
  }
}

// Require resource ownership or admin permission
export async function requireOwnershipOrAdmin(
  resourceType: 'order' | 'address' | 'wishlist' | 'review',
  resourceId: string
): Promise<AuthContext | NextResponse> {
  const context = await getAuthContext()
  
  if (!context) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  // Admins can access any resource
  if (hasPermission(context.user.role, 'READ_ALL')) {
    return context
  }
  
  // Check if user owns the resource
  const isOwner = await requireResourceOwnership(resourceType, resourceId, context.user.id)
  
  if (!isOwner) {
    return NextResponse.json(
      { error: 'Access denied: You can only access your own resources' },
      { status: 403 }
    )
  }
  
  return context
}

// Rate limiting check (integrated with advanced rate limiting system)
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  // Import rate limiting functions
  const { rateLimit } = await import('./rate-limit')
  
  // Create a proper mock request object for rate limiting
  const mockHeaders = new Headers()
  mockHeaders.set('x-forwarded-for', identifier)
  
  const mockRequest = {
    headers: mockHeaders,
    ip: identifier,
    nextUrl: new URL('http://localhost:3000'),
    url: 'http://localhost:3000',
    method: 'GET',
  } as unknown as NextRequest
  
  const result = await rateLimit(mockRequest, {
    windowMs,
    maxRequests,
    keyGenerator: () => identifier,
  })
  
  return {
    allowed: result.success,
    remaining: result.remaining,
    resetTime: result.reset
  }
}

// IP-based access control
export function validateIPAccess(request: NextRequest): boolean {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] || realIP || 'unknown'
  
  // Basic IP validation (you can extend this with allowlists/blocklists)
  if (ip === 'unknown') {
    return false
  }
  
  // Block known malicious IP ranges (example)
  const blockedRanges = [
    '127.0.0.1', // localhost (for testing)
    // Add more blocked ranges as needed
  ]
  
  return !blockedRanges.some(range => ip.startsWith(range))
}

// Import comprehensive security headers
import { applySecurityHeaders as applyComprehensiveSecurityHeaders } from './security-headers'

// Apply security headers to response (using comprehensive security headers)
export function applySecurityHeaders(response: NextResponse): NextResponse {
  return applyComprehensiveSecurityHeaders(response, 'api')
}

// Audit log for sensitive operations
export async function auditLog(
  action: string,
  resourceType: string,
  resourceId: string,
  userId: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    // In production, you would store this in a dedicated audit log table
    console.log('AUDIT LOG:', {
      timestamp: new Date().toISOString(),
      action,
      resourceType,
      resourceId,
      userId,
      details,
    })
    
    // Example: Store in database
    // await prisma.auditLog.create({
    //   data: {
    //     action,
    //     resourceType,
    //     resourceId,
    //     userId,
    //     details: details ? JSON.stringify(details) : null,
    //   }
    // })
  } catch (error) {
    console.error('Audit log error:', error)
  }
}

// Helper to create authorized API handler with advanced rate limiting
export function withAuth<T extends Record<string, unknown>>(
  handler: (context: AuthContext, ...args: T[]) => Promise<NextResponse>,
  options: {
    requireRole?: Role
    requirePermission?: Permission
    rateLimit?: { maxRequests: number; windowMs: number }
  } = {}
) {
  return async (request: NextRequest, ...args: T[]): Promise<NextResponse> => {
    try {
      // IP validation
      if (!validateIPAccess(request)) {
        return NextResponse.json(
          { error: 'Access denied from this IP' },
          { status: 403 }
        )
      }
      
      // Advanced rate limiting
      if (options.rateLimit) {
        const { rateLimit } = await import('./rate-limit')
        const rateLimitResult = await rateLimit(request, {
          windowMs: options.rateLimit.windowMs,
          maxRequests: options.rateLimit.maxRequests,
        })
        
        if (!rateLimitResult.success) {
          const response = NextResponse.json(
            { 
              error: 'Rate limit exceeded',
              message: 'Too many requests. Please try again later.',
              retryAfter: rateLimitResult.retryAfter,
            },
            { status: 429 }
          )
          
          // Add rate limit headers
          response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
          response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
          response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())
          
          if (rateLimitResult.retryAfter) {
            response.headers.set('Retry-After', rateLimitResult.retryAfter.toString())
          }
          
          return response
        }
      }
      
      // Authentication and authorization
      let context: AuthContext
      
      if (options.requireRole) {
        const result = await requireRole(options.requireRole)
        if (result instanceof NextResponse) return result
        context = result
      } else if (options.requirePermission) {
        const result = await requirePermission(options.requirePermission)
        if (result instanceof NextResponse) return result
        context = result
      } else {
        const result = await requireAuth()
        if (result instanceof NextResponse) return result
        context = result
      }
      
      // Call the actual handler
      const response = await handler(context, ...args)
      
      // Apply security headers
      return applySecurityHeaders(response)
      
    } catch (error) {
      console.error('Authorization middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// All functions are already exported above, no need for duplicate exports
