// Input validation utilities for API routes
import { z } from 'zod'

// Common validation schemas
export const commonSchemas = {
  // ID validation (UUID or alphanumeric)
  id: z.string().min(1).max(50).regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid ID format'),
  
  // Email validation
  email: z.string().email('Invalid email format').max(255),
  
  // Password validation (strong password requirements)
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number, and special character'),
  
  // Name validation
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters'),
  
  // Phone validation
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  
  // URL validation with security checks
  url: z.string().url('Invalid URL format').max(2048).optional(),
  
  // Price validation (positive number with max 2 decimal places)
  price: z.number()
    .positive('Price must be positive')
    .max(1000000, 'Price too high')
    .refine(val => Number((val * 100).toFixed(0)) / 100 === val, 'Price can have max 2 decimal places'),
  
  // Quantity validation
  quantity: z.number().int().min(1).max(999),
  
  // Search query validation
  searchQuery: z.string()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query too long')
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Search query contains invalid characters'),
  
  // Pagination
  page: z.number().int().min(1).max(1000).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  
  // Sort validation
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}

// Product validation schemas
export const productSchemas = {
  create: z.object({
    name: commonSchemas.name,
    description: z.string().max(2000).optional(),
    price: commonSchemas.price,
    categoryId: commonSchemas.id,
    images: z.array(z.string().url()).max(10).default([]),
    stock: z.number().int().min(0).max(99999).default(0),
    sku: z.string().max(50).optional(),
    weight: z.number().positive().optional(),
    dimensions: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    }).optional(),
  }),
  
  update: z.object({
    name: commonSchemas.name.optional(),
    description: z.string().max(2000).optional(),
    price: commonSchemas.price.optional(),
    categoryId: commonSchemas.id.optional(),
    images: z.array(z.string().url()).max(10).optional(),
    stock: z.number().int().min(0).max(99999).optional(),
    sku: z.string().max(50).optional(),
    weight: z.number().positive().optional(),
    dimensions: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    }).optional(),
  }),
}

// User validation schemas
export const userSchemas = {
  register: z.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    password: commonSchemas.password,
    phone: commonSchemas.phone,
  }),
  
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),
  
  updateProfile: z.object({
    name: commonSchemas.name.optional(),
    phone: commonSchemas.phone,
    avatar: z.string().url().optional(),
  }),
  
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
}

// Order validation schemas
export const orderSchemas = {
  create: z.object({
    items: z.array(z.object({
      productId: commonSchemas.id,
      quantity: commonSchemas.quantity,
      price: commonSchemas.price,
    })).min(1, 'At least one item is required'),
    shippingAddressId: commonSchemas.id,
    notes: z.string().max(500).optional(),
  }),
  
  updateStatus: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    notes: z.string().max(500).optional(),
    trackingNumber: z.string().max(100).optional(),
  }),
}

// Address validation schemas
export const addressSchemas = {
  create: z.object({
    street: z.string().min(1, 'Street is required').max(200),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().min(1, 'State is required').max(100),
    postalCode: z.string().min(1, 'Postal code is required').max(20),
    country: z.string().min(1, 'Country is required').max(100),
    isDefault: z.boolean().default(false),
  }),
}

// Review validation schemas
export const reviewSchemas = {
  create: z.object({
    productId: commonSchemas.id,
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1, 'Comment is required').max(1000),
    title: z.string().max(100).optional(),
  }),
}

// Generic validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

// Sanitize HTML input to prevent XSS
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// Validate and sanitize file upload
export function validateFileUpload(file: {
  name: string
  size: number
  type: string
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('File size must be less than 5MB')
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type must be JPEG, PNG, WebP, or GIF')
  }
  
  // Check filename
  if (!/^[a-zA-Z0-9\-_.]+\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)) {
    errors.push('Invalid filename format')
  }
  
  return { valid: errors.length === 0, errors }
}

// Rate limiting validation
export function validateRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  // This would typically use Redis or a database
  // For now, we'll simulate the check
  const remaining = Math.max(0, maxRequests - 1)
  const resetTime = Date.now() + windowMs
  
  return {
    allowed: remaining > 0,
    remaining,
    resetTime
  }
}

// IP validation and sanitization
export function validateAndSanitizeIP(ip: string): string | null {
  if (!ip || typeof ip !== 'string') return null
  
  // Remove any potential injection attempts
  const cleanIP = ip.replace(/[^0-9a-fA-F:.]/g, '')
  
  // Basic IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipv4Regex.test(cleanIP)) {
    const parts = cleanIP.split('.')
    if (parts.every(part => parseInt(part) <= 255)) {
      return cleanIP
    }
  }
  
  // Basic IPv6 validation
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  if (ipv6Regex.test(cleanIP)) {
    return cleanIP
  }
  
  return null
}

// Export all schemas for easy access
export const validationSchemas = {
  common: commonSchemas,
  product: productSchemas,
  user: userSchemas,
  order: orderSchemas,
  address: addressSchemas,
  review: reviewSchemas,
}
