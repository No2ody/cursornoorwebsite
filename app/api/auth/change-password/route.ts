import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { 
  changePasswordSchema, 
  hashPassword, 
  verifyPassword,
  isPasswordRecentlyUsed,
  storePasswordHistory,
  securityHeaders
} from '@/lib/password-security'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      const response = NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
      
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
    }

    const body = await request.json()
    
    // Validate input with comprehensive password security checks
    const validatedData = changePasswordSchema.parse(body)
    const { currentPassword, newPassword } = validatedData

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        password: true,
        name: true
      }
    })

    if (!user || !user.password) {
      const response = NextResponse.json(
        { message: 'User not found or account not configured for password authentication' },
        { status: 400 }
      )
      
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      // Log failed attempt for security monitoring
      await prisma.loginAttempt.create({
        data: {
          userId: user.id,
          email: user.email,
          successful: false,
          ipAddress: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      const response = NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      )
      
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
    }

    // Check if new password was used recently
    const wasRecentlyUsed = await isPasswordRecentlyUsed(user.id, newPassword, prisma)
    if (wasRecentlyUsed) {
      const response = NextResponse.json(
        { message: 'Password was recently used. Please choose a different password.' },
        { status: 400 }
      )
      
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password and store in history using transaction
    await prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedNewPassword,
          // Update last login to force re-authentication if needed
          lastLoginAt: new Date()
        }
      })

      // Store password in history
      await storePasswordHistory(user.id, hashedNewPassword, tx)

      // Log successful password change
      await tx.loginAttempt.create({
        data: {
          userId: user.id,
          email: user.email,
          successful: true,
          ipAddress: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
    })

    // TODO: Send email notification about password change
    // This would be a good place to send a security notification email

    const response = NextResponse.json({
      message: 'Password changed successfully'
    }, { status: 200 })

    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response

  } catch (error) {
    console.error('Change password error:', error)

    if (error instanceof z.ZodError) {
      const response = NextResponse.json(
        { 
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
      
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
    }

    const response = NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
    
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }
}

// Add security headers to all responses
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}
