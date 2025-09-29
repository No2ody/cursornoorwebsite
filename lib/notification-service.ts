// Push Notification Service
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Notification types and schemas
export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: Record<string, unknown>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  timestamp?: number
  ttl?: number
}

export interface NotificationTarget {
  userId?: string
  userIds?: string[]
  segment?: string
  role?: string
  all?: boolean
}

export const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  body: z.string().min(1, 'Body is required').max(300, 'Body too long'),
  icon: z.string().url().optional(),
  badge: z.string().url().optional(),
  image: z.string().url().optional(),
  data: z.record(z.unknown()).optional(),
  actions: z.array(z.object({
    action: z.string(),
    title: z.string(),
    icon: z.string().optional(),
  })).optional(),
  tag: z.string().optional(),
  requireInteraction: z.boolean().optional(),
  silent: z.boolean().optional(),
  ttl: z.number().positive().optional(),
})

export const targetSchema = z.object({
  userId: z.string().optional(),
  userIds: z.array(z.string()).optional(),
  segment: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  all: z.boolean().optional(),
}).refine(data => {
  const targets = [data.userId, data.userIds, data.segment, data.role, data.all]
  return targets.filter(Boolean).length === 1
}, { message: 'Exactly one target type must be specified' })

// Notification templates for different events
export const NOTIFICATION_TEMPLATES = {
  // Order notifications
  ORDER_CONFIRMED: {
    title: 'Order Confirmed',
    body: 'Your order #{orderNumber} has been confirmed and is being processed.',
    icon: '/icons/order-confirmed.png',
    tag: 'order-update',
    data: { type: 'order', action: 'confirmed' }
  },
  ORDER_SHIPPED: {
    title: 'Order Shipped',
    body: 'Your order #{orderNumber} has been shipped and is on its way!',
    icon: '/icons/order-shipped.png',
    tag: 'order-update',
    data: { type: 'order', action: 'shipped' }
  },
  ORDER_DELIVERED: {
    title: 'Order Delivered',
    body: 'Your order #{orderNumber} has been delivered. Thank you for shopping with us!',
    icon: '/icons/order-delivered.png',
    tag: 'order-update',
    data: { type: 'order', action: 'delivered' }
  },
  ORDER_CANCELLED: {
    title: 'Order Cancelled',
    body: 'Your order #{orderNumber} has been cancelled. Refund will be processed within 3-5 business days.',
    icon: '/icons/order-cancelled.png',
    tag: 'order-update',
    data: { type: 'order', action: 'cancelled' }
  },

  // Account notifications
  ACCOUNT_VERIFIED: {
    title: 'Account Verified',
    body: 'Congratulations! Your account has been successfully verified.',
    icon: '/icons/account-verified.png',
    tag: 'account-update',
    data: { type: 'account', action: 'verified' }
  },
  KYC_APPROVED: {
    title: 'KYC Approved',
    body: 'Your identity verification has been approved. You now have full access to all features.',
    icon: '/icons/kyc-approved.png',
    tag: 'account-update',
    data: { type: 'kyc', action: 'approved' }
  },
  KYC_REJECTED: {
    title: 'KYC Requires Attention',
    body: 'Your identity verification needs additional information. Please check your account.',
    icon: '/icons/kyc-rejected.png',
    tag: 'account-update',
    requireInteraction: true,
    data: { type: 'kyc', action: 'rejected' }
  },

  // Promotional notifications
  SALE_ANNOUNCEMENT: {
    title: 'Special Sale Alert!',
    body: 'Don\'t miss out on our limited-time sale with up to 50% off selected items.',
    icon: '/icons/sale.png',
    image: '/images/sale-banner.jpg',
    tag: 'promotion',
    actions: [
      { action: 'view-sale', title: 'Shop Now', icon: '/icons/shop.png' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: { type: 'promotion', action: 'sale' }
  },
  NEW_PRODUCT: {
    title: 'New Products Available',
    body: 'Check out our latest collection of premium lighting and bathroom fixtures.',
    icon: '/icons/new-product.png',
    tag: 'product-update',
    data: { type: 'product', action: 'new-arrival' }
  },
  PRICE_DROP: {
    title: 'Price Drop Alert',
    body: 'Great news! The price of {productName} has dropped by {discount}%.',
    icon: '/icons/price-drop.png',
    tag: 'price-alert',
    data: { type: 'product', action: 'price-drop' }
  },

  // Reminder notifications
  CART_ABANDONMENT: {
    title: 'Don\'t Forget Your Cart',
    body: 'You have {itemCount} item(s) waiting in your cart. Complete your purchase now!',
    icon: '/icons/cart-reminder.png',
    tag: 'cart-reminder',
    actions: [
      { action: 'view-cart', title: 'View Cart', icon: '/icons/cart.png' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: { type: 'reminder', action: 'cart-abandonment' }
  },
  WISHLIST_REMINDER: {
    title: 'Wishlist Items on Sale',
    body: 'Some items in your wishlist are now on sale. Don\'t miss out!',
    icon: '/icons/wishlist.png',
    tag: 'wishlist-reminder',
    data: { type: 'reminder', action: 'wishlist-sale' }
  },

  // System notifications
  MAINTENANCE_NOTICE: {
    title: 'Scheduled Maintenance',
    body: 'Our website will be under maintenance from {startTime} to {endTime}. We apologize for any inconvenience.',
    icon: '/icons/maintenance.png',
    tag: 'system-notice',
    requireInteraction: true,
    data: { type: 'system', action: 'maintenance' }
  },
  SECURITY_ALERT: {
    title: 'Security Alert',
    body: 'We detected a new login to your account. If this wasn\'t you, please secure your account immediately.',
    icon: '/icons/security-alert.png',
    tag: 'security-alert',
    requireInteraction: true,
    actions: [
      { action: 'secure-account', title: 'Secure Account', icon: '/icons/security.png' },
      { action: 'ignore', title: 'This was me' }
    ],
    data: { type: 'security', action: 'login-alert' }
  }
}

// Push Notification Service Class
export class NotificationService {
  // Send notification to specific targets
  static async sendNotification(
    payload: NotificationPayload,
    target: NotificationTarget,
    options: {
      scheduleAt?: Date
      expiresAt?: Date
      priority?: 'low' | 'normal' | 'high'
      category?: string
    } = {}
  ) {
    try {
      // Validate payload
      const validatedPayload = notificationSchema.parse(payload)
      const validatedTarget = targetSchema.parse(target)

      // Get target user IDs
      const userIds = await this.resolveTargetUsers(validatedTarget)
      
      if (userIds.length === 0) {
        throw new Error('No target users found')
      }

      // Create notification records
      const notifications = await Promise.all(
        userIds.map(userId => 
          prisma.notification.create({
            data: {
              userId,
              title: validatedPayload.title,
              body: validatedPayload.body,
              icon: validatedPayload.icon,
              badge: validatedPayload.badge,
              image: validatedPayload.image,
              data: (validatedPayload.data || {}) as any,
              actions: validatedPayload.actions || [],
              tag: validatedPayload.tag,
              requireInteraction: validatedPayload.requireInteraction || false,
              silent: validatedPayload.silent || false,
              ttl: validatedPayload.ttl,
              scheduleAt: options.scheduleAt,
              expiresAt: options.expiresAt,
              priority: (options.priority || 'normal') as any,
              category: options.category || 'general',
              status: options.scheduleAt ? 'SCHEDULED' : 'PENDING',
            }
          })
        )
      )

      // Send immediate notifications (not scheduled)
      if (!options.scheduleAt) {
        await this.deliverNotifications(notifications.map(n => n.id))
      }

      return {
        success: true,
        notificationIds: notifications.map(n => n.id),
        targetCount: userIds.length
      }

    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  }

  // Send templated notification
  static async sendTemplatedNotification(
    templateKey: keyof typeof NOTIFICATION_TEMPLATES,
    target: NotificationTarget,
    variables: Record<string, any> = {},
    options: {
      scheduleAt?: Date
      expiresAt?: Date
      priority?: 'low' | 'normal' | 'high'
      category?: string
    } = {}
  ) {
    const template = NOTIFICATION_TEMPLATES[templateKey]
    
    if (!template) {
      throw new Error(`Template ${templateKey} not found`)
    }

    // Replace variables in template
    const payload: NotificationPayload = {
      ...template,
      title: this.replaceVariables(template.title, variables),
      body: this.replaceVariables(template.body, variables),
      data: {
        ...template.data,
        template: templateKey,
        variables
      }
    }

    return this.sendNotification(payload, target, {
      ...options,
      category: options.category || templateKey.toLowerCase()
    })
  }

  // Get user notifications
  static async getUserNotifications(
    userId: string,
    options: {
      limit?: number
      offset?: number
      unreadOnly?: boolean
      category?: string
    } = {}
  ) {
    const where: any = { userId }
    
    if (options.unreadOnly) {
      where.readAt = null
    }
    
    if (options.category) {
      where.category = options.category
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options.limit || 50,
        skip: options.offset || 0,
      }),
      prisma.notification.count({ where })
    ])

    return { notifications, total }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string) {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    })
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    })
  }

  // Delete notification
  static async deleteNotification(notificationId: string, userId: string) {
    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId
      }
    })
  }

  // Get notification statistics
  static async getNotificationStats(userId?: string) {
    const where = userId ? { userId } : {}

    const [total, unread, byCategory, byStatus] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, readAt: null } }),
      prisma.notification.groupBy({
        by: ['category'],
        where,
        _count: { id: true }
      }),
      prisma.notification.groupBy({
        by: ['status'],
        where,
        _count: { id: true }
      })
    ])

    return {
      total,
      unread,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count.id
        return acc
      }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id
        return acc
      }, {} as Record<string, number>)
    }
  }

  // Process scheduled notifications
  static async processScheduledNotifications() {
    const now = new Date()
    
    const scheduledNotifications = await prisma.notification.findMany({
      where: {
        status: 'SCHEDULED',
        scheduleAt: {
          lte: now
        }
      }
    })

    if (scheduledNotifications.length > 0) {
      await this.deliverNotifications(scheduledNotifications.map(n => n.id))
    }

    return scheduledNotifications.length
  }

  // Clean up expired notifications
  static async cleanupExpiredNotifications() {
    const now = new Date()
    
    const result = await prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    })

    return result.count
  }

  // Helper methods
  private static async resolveTargetUsers(target: NotificationTarget): Promise<string[]> {
    if (target.userId) {
      return [target.userId]
    }
    
    if (target.userIds) {
      return target.userIds
    }
    
    if (target.all) {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true }
      })
      return users.map(u => u.id)
    }
    
    if (target.role) {
      const users = await prisma.user.findMany({
        where: { 
          role: target.role as any,
          isActive: true 
        },
        select: { id: true }
      })
      return users.map(u => u.id)
    }
    
    if (target.segment) {
      // Implement customer segment logic here
      // For now, return empty array
      return []
    }
    
    return []
  }

  private static async deliverNotifications(notificationIds: string[]) {
    // Update status to SENT
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds }
      },
      data: {
        status: 'SENT',
        sentAt: new Date()
      }
    })

    // Here you would integrate with actual push notification services
    // like Firebase Cloud Messaging, Apple Push Notification Service, etc.
    console.log(`Delivered ${notificationIds.length} notifications`)
  }

  private static replaceVariables(text: string, variables: Record<string, any>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key]?.toString() || match
    })
  }
}

// Notification preferences management
export class NotificationPreferences {
  static async getUserPreferences(userId: string) {
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    })
    
    return preferences || this.getDefaultPreferences()
  }

  static async updateUserPreferences(
    userId: string, 
    preferences: Partial<{
      emailNotifications: boolean
      pushNotifications: boolean
      smsNotifications: boolean
      orderUpdates: boolean
      promotionalOffers: boolean
      priceAlerts: boolean
      securityAlerts: boolean
      systemNotifications: boolean
    }>
  ) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...this.getDefaultPreferences(),
        ...preferences
      },
      update: preferences
    })
  }

  private static getDefaultPreferences() {
    return {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      orderUpdates: true,
      promotionalOffers: true,
      priceAlerts: false,
      securityAlerts: true,
      systemNotifications: true
    }
  }
}
