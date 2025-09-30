import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

// Error types and interfaces
export interface AppError extends Error {
  statusCode: number
  code: string
  isOperational: boolean
  context?: Record<string, unknown>
}

export interface ErrorResponse {
  error: {
    message: string
    code: string
    statusCode: number
    timestamp: string
    requestId?: string
    details?: unknown
  }
}

// Error codes
export const ERROR_CODES = {
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Authentication errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Authorization errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Resource errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // Conflict errors (409)
  CONFLICT: 'CONFLICT',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  
  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Business logic errors
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ORDER_PROCESSING_ERROR: 'ORDER_PROCESSING_ERROR',
  
  // File/Upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED'
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// Custom error classes
export class AppErrorClass extends Error implements AppError {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean
  public readonly context?: Record<string, unknown>

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    context?: Record<string, unknown>,
    isOperational = true
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    this.context = context

    Error.captureStackTrace(this, this.constructor)
  }
}

// Specific error classes
export class ValidationError extends AppErrorClass {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR, context)
  }
}

export class AuthenticationError extends AppErrorClass {
  constructor(message: string = 'Authentication required', context?: Record<string, unknown>) {
    super(message, 401, ERROR_CODES.UNAUTHORIZED, context)
  }
}

export class AuthorizationError extends AppErrorClass {
  constructor(message: string = 'Insufficient permissions', context?: Record<string, unknown>) {
    super(message, 403, ERROR_CODES.FORBIDDEN, context)
  }
}

export class NotFoundError extends AppErrorClass {
  constructor(resource: string = 'Resource', context?: Record<string, unknown>) {
    super(`${resource} not found`, 404, ERROR_CODES.NOT_FOUND, context)
  }
}

export class ConflictError extends AppErrorClass {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 409, ERROR_CODES.CONFLICT, context)
  }
}

export class RateLimitError extends AppErrorClass {
  constructor(message: string = 'Rate limit exceeded', context?: Record<string, unknown>) {
    super(message, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED, context)
  }
}

export class InternalServerError extends AppErrorClass {
  constructor(message: string = 'Internal server error', context?: Record<string, unknown>) {
    super(message, 500, ERROR_CODES.INTERNAL_ERROR, context, false)
  }
}

// Error handler class
export class ErrorHandler {
  
  /**
   * Handle different types of errors and convert them to AppError
   */
  static handleError(error: unknown, context?: Record<string, unknown>): AppError {
    // Already an AppError
    if (error instanceof AppErrorClass) {
      return error
    }
    
    // Zod validation errors
    if (error instanceof ZodError) {
      return new ValidationError(
        'Validation failed',
        {
          ...context,
          validationErrors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        }
      )
    }
    
    // Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(error, context)
    }
    
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return new InternalServerError('Database error occurred', {
        ...context,
        prismaError: error.message
      })
    }
    
    if (error instanceof Prisma.PrismaClientValidationError) {
      return new ValidationError('Database validation error', {
        ...context,
        prismaError: error.message
      })
    }
    
    // Standard Error objects
    if (error instanceof Error) {
      return new InternalServerError(error.message, {
        ...context,
        originalError: error.name,
        stack: error.stack
      })
    }
    
    // Unknown error types
    return new InternalServerError('An unexpected error occurred', {
      ...context,
      unknownError: String(error)
    })
  }
  
  /**
   * Handle Prisma-specific errors
   */
  private static handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
    context?: Record<string, unknown>
  ): AppError {
    const prismaContext = {
      ...context,
      prismaCode: error.code,
      prismaMessage: error.message
    }
    
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        return new ConflictError(
          'A record with this information already exists',
          prismaContext
        )
        
      case 'P2025':
        // Record not found
        return new NotFoundError('Record', prismaContext)
        
      case 'P2003':
        // Foreign key constraint violation
        return new ValidationError(
          'Referenced record does not exist',
          prismaContext
        )
        
      case 'P2014':
        // Required relation violation
        return new ValidationError(
          'Required relationship is missing',
          prismaContext
        )
        
      case 'P2021':
        // Table does not exist
        return new InternalServerError(
          'Database schema error',
          prismaContext
        )
        
      case 'P1001':
        // Connection error
        return new InternalServerError(
          'Database connection failed',
          prismaContext
        )
        
      default:
        return new InternalServerError(
          'Database operation failed',
          prismaContext
        )
    }
  }
  
  /**
   * Create error response for API routes
   */
  static createErrorResponse(
    error: AppError,
    requestId?: string
  ): NextResponse<ErrorResponse> {
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId }),
        ...(process.env.NODE_ENV === 'development' && {
          details: error.context
        })
      }
    }
    
    return NextResponse.json(errorResponse, {
      status: error.statusCode,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
  
  /**
   * Log error with appropriate level
   */
  static logError(error: AppError, request?: NextRequest): void {
    const logData = {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
      context: error.context,
      ...(request && {
        url: request.url,
        method: request.method,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      })
    }
    
    if (error.statusCode >= 500) {
      console.error('Server Error:', logData)
    } else if (error.statusCode >= 400) {
      console.warn('Client Error:', logData)
    } else {
      console.info('Error:', logData)
    }
  }
}

/**
 * Error handling middleware for API routes
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      return await handler(request, ...args)
    } catch (error) {
      const requestId = request.headers.get('x-request-id') || 
                       crypto.randomUUID()
      
      const appError = ErrorHandler.handleError(error, {
        url: request.url,
        method: request.method
      })
      
      // Log the error
      ErrorHandler.logError(appError, request)
      
      // Return error response
      return ErrorHandler.createErrorResponse(appError, requestId)
    }
  }
}

/**
 * Async error wrapper for better error handling
 */
export function asyncHandler<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw ErrorHandler.handleError(error)
    }
  }
}

/**
 * Validation helper with error handling
 */
export function validateOrThrow<T>(
  data: unknown,
  schema: { parse: (data: unknown) => T },
  context?: Record<string, unknown>
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    throw ErrorHandler.handleError(error, context)
  }
}

/**
 * Business logic error helpers
 */
export const BusinessErrors = {
  insufficientStock: (productName: string, available: number, requested: number) =>
    new AppErrorClass(
      `Insufficient stock for ${productName}`,
      400,
      ERROR_CODES.INSUFFICIENT_STOCK,
      { productName, available, requested }
    ),
    
  paymentFailed: (reason: string, paymentId?: string) =>
    new AppErrorClass(
      'Payment processing failed',
      402,
      ERROR_CODES.PAYMENT_FAILED,
      { reason, paymentId }
    ),
    
  orderProcessingError: (orderId: string, reason: string) =>
    new AppErrorClass(
      'Order processing failed',
      500,
      ERROR_CODES.ORDER_PROCESSING_ERROR,
      { orderId, reason }
    ),
    
  fileTooLarge: (maxSize: number, actualSize: number) =>
    new AppErrorClass(
      `File size exceeds limit of ${maxSize} bytes`,
      413,
      ERROR_CODES.FILE_TOO_LARGE,
      { maxSize, actualSize }
    ),
    
  invalidFileType: (allowedTypes: string[], actualType: string) =>
    new AppErrorClass(
      'Invalid file type',
      400,
      ERROR_CODES.INVALID_FILE_TYPE,
      { allowedTypes, actualType }
    )
}

/**
 * Global error boundary component props
 */
export interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  children: React.ReactNode
}

/**
 * Error recovery utilities
 */
export const ErrorRecovery = {
  /**
   * Retry function with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number
      baseDelay?: number
      maxDelay?: number
      backoffFactor?: number
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2
    } = options
    
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt === maxAttempts) {
          throw lastError
        }
        
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt - 1),
          maxDelay
        )
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError!
  },
  
  /**
   * Circuit breaker pattern
   */
  createCircuitBreaker<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    options: {
      failureThreshold?: number
      resetTimeout?: number
      monitoringPeriod?: number
    } = {}
  ) {
    const {
      failureThreshold = 5,
      resetTimeout = 60000,
      monitoringPeriod = 60000
    } = options
    
    let failures = 0
    let lastFailureTime = 0
    let state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
    
    return async (...args: T): Promise<R> => {
      const now = Date.now()
      
      // Reset failure count after monitoring period
      if (now - lastFailureTime > monitoringPeriod) {
        failures = 0
      }
      
      // Check if circuit should be reset
      if (state === 'OPEN' && now - lastFailureTime > resetTimeout) {
        state = 'HALF_OPEN'
      }
      
      // Reject if circuit is open
      if (state === 'OPEN') {
        throw new InternalServerError('Service temporarily unavailable')
      }
      
      try {
        const result = await fn(...args)
        
        // Reset on success
        if (state === 'HALF_OPEN') {
          state = 'CLOSED'
          failures = 0
        }
        
        return result
      } catch (error) {
        failures++
        lastFailureTime = now
        
        // Open circuit if threshold reached
        if (failures >= failureThreshold) {
          state = 'OPEN'
        }
        
        throw error
      }
    }
  }
}
