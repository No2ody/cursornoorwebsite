// Password Security Utilities
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Security configuration
export const PASSWORD_CONFIG = {
  minLength: 8,
  maxLength: 128,
  saltRounds: 12,
  // Password history to prevent reuse
  historyLimit: 5,
  // Account lockout settings
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
}

// Password strength requirements
export const passwordSchema = z
  .string()
  .min(PASSWORD_CONFIG.minLength, `Password must be at least ${PASSWORD_CONFIG.minLength} characters`)
  .max(PASSWORD_CONFIG.maxLength, `Password must be no more than ${PASSWORD_CONFIG.maxLength} characters`)
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character')
  .refine((password) => {
    // Check for common patterns
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /letmein/i,
      /welcome/i,
      /monkey/i,
      /dragon/i,
    ]
    return !commonPatterns.some(pattern => pattern.test(password))
  }, 'Password contains common patterns and is not secure')
  .refine((password) => {
    // Check for sequential characters
    const sequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i
    return !sequential.test(password)
  }, 'Password contains sequential characters')
  .refine((password) => {
    // Check for repeated characters
    const repeated = /(.)\1{2,}/
    return !repeated.test(password)
  }, 'Password contains too many repeated characters')

// Change password schema with confirmation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New password and confirmation don't match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
})

// Password strength calculator
export function calculatePasswordStrength(password: string): {
  score: number // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []

  if (!password) {
    return { score: 0, level: 'weak', feedback: ['Password is required'] }
  }

  // Length scoring
  if (password.length >= 8) score += 20
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 10
  else feedback.push('Add lowercase letters')

  if (/[A-Z]/.test(password)) score += 10
  else feedback.push('Add uppercase letters')

  if (/\d/.test(password)) score += 10
  else feedback.push('Add numbers')

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15
  else feedback.push('Add special characters')

  // Pattern penalties
  if (/(.)\1{2,}/.test(password)) {
    score -= 10
    feedback.push('Avoid repeated characters')
  }

  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password)) {
    score -= 15
    feedback.push('Avoid sequential characters')
  }

  // Common password penalties
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
  ]
  if (commonPatterns.some(pattern => pattern.test(password))) {
    score -= 20
    feedback.push('Avoid common passwords')
  }

  // Entropy bonus for mixed case and symbols
  const uniqueChars = new Set(password).size
  if (uniqueChars >= password.length * 0.7) score += 10

  // Clamp score
  score = Math.max(0, Math.min(100, score))

  // Determine level
  let level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  if (score < 30) level = 'weak'
  else if (score < 50) level = 'fair'
  else if (score < 70) level = 'good'
  else if (score < 90) level = 'strong'
  else level = 'very-strong'

  return { score, level, feedback }
}

// Hash password with secure settings
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_CONFIG.saltRounds)
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Check if password was used recently (for preventing reuse)
export async function isPasswordRecentlyUsed(
  userId: string,
  newPassword: string,
  prisma: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<boolean> {
  try {
    // Get recent password hashes from user's password history
    const passwordHistory = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PASSWORD_CONFIG.historyLimit,
    })

    // Check if new password matches any recent passwords
    for (const entry of passwordHistory) {
      if (await verifyPassword(newPassword, entry.passwordHash)) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error('Error checking password history:', error)
    return false
  }
}

// Store password in history
export async function storePasswordHistory(
  userId: string,
  passwordHash: string,
  prisma: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<void> {
  try {
    // Add new password to history
    await prisma.passwordHistory.create({
      data: {
        userId,
        passwordHash,
      },
    })

    // Clean up old entries beyond the limit
    const oldEntries = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: PASSWORD_CONFIG.historyLimit,
    })

    if (oldEntries.length > 0) {
        await prisma.passwordHistory.deleteMany({
          where: {
            id: {
              in: oldEntries.map((entry: { id: string }) => entry.id)
            }
          }
        })
    }
  } catch (error) {
    console.error('Error storing password history:', error)
  }
}

// Security headers for password-related endpoints
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// Rate limiting configuration for password operations
export const rateLimitConfig = {
  changePassword: {
    maxRequests: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  resetPassword: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  loginAttempts: {
    maxRequests: PASSWORD_CONFIG.maxAttempts,
    windowMs: PASSWORD_CONFIG.lockoutDuration,
  },
}
