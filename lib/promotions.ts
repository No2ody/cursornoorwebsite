import prisma from '@/lib/prisma'
import { 
  PromotionType, 
  PromotionTargetType, 
  PromotionStatus,
  Promotion,
  User
} from '@prisma/client'

// Types for cart and promotion calculations
export interface CartItem {
  productId: string
  quantity: number
  price: number
  product?: {
    id: string
    name: string
    categoryId: string
    price: number
  }
}

export interface CartSummary {
  items: CartItem[]
  subtotal: number
  user?: Pick<User, 'id' | 'role' | 'email' | 'createdAt'>
  shippingAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export interface PromotionCalculation {
  promotionId: string
  promotionName: string
  promotionCode?: string
  discountAmount: number
  freeShipping?: boolean
  applicableItems: string[] // Product IDs that this promotion applies to
  description: string
}

export interface CartCalculationResult {
  subtotal: number
  appliedPromotions: PromotionCalculation[]
  totalDiscount: number
  shippingCost: number
  taxAmount: number
  total: number
  availablePromotions?: Promotion[] // Promotions that could be applied
}

/**
 * Main promotion calculation service
 */
export class PromotionService {
  /**
   * Calculate promotions for a cart
   */
  static async calculateCartPromotions(
    cart: CartSummary,
    appliedCoupons: string[] = []
  ): Promise<CartCalculationResult> {
    const now = new Date()
    
    // Get all applicable promotions
    const availablePromotions = await this.getAvailablePromotions(cart, now)
    
    // Get specific promotions from coupon codes
    const couponPromotions = await this.getPromotionsFromCoupons(appliedCoupons, cart.user?.id)
    
    // Combine all promotions
    const allPromotions = [...availablePromotions, ...couponPromotions]
    
    // Sort by priority (higher first)
    allPromotions.sort((a, b) => b.priority - a.priority)
    
    const appliedPromotions: PromotionCalculation[] = []
    let remainingItems = [...cart.items]
    let totalDiscount = 0
    let freeShipping = false
    
    for (const promotion of allPromotions) {
        const calculation = await this.calculateSinglePromotion(
          promotion,
          remainingItems,
          cart
        )
      
      if (calculation && calculation.discountAmount > 0) {
        appliedPromotions.push(calculation)
        totalDiscount += calculation.discountAmount
        
        if (calculation.freeShipping) {
          freeShipping = true
        }
        
        // If promotion is not stackable, break
        if (!promotion.stackable) {
          break
        }
        
        // Update remaining items for stackable promotions
        if (promotion.targetType === PromotionTargetType.SPECIFIC_PRODUCT) {
          remainingItems = remainingItems.filter(
            item => !calculation.applicableItems.includes(item.productId)
          )
        }
      }
    }
    
    // Calculate final amounts
    const subtotal = cart.subtotal
    const shippingCost = freeShipping ? 0 : this.calculateShipping(cart)
    const taxAmount = this.calculateTax(subtotal - totalDiscount)
    const total = subtotal - totalDiscount + shippingCost + taxAmount
    
    return {
      subtotal,
      appliedPromotions,
      totalDiscount,
      shippingCost,
      taxAmount,
      total,
      availablePromotions: availablePromotions.filter(
        p => !appliedPromotions.some(ap => ap.promotionId === p.id)
      )
    }
  }
  
  /**
   * Get available promotions for a cart
   */
  private static async getAvailablePromotions(
    cart: CartSummary,
    now: Date
  ): Promise<Promotion[]> {
    const productIds = cart.items.map(item => item.productId)
    const categoryIds = cart.items
      .map(item => item.product?.categoryId)
      .filter(Boolean) as string[]
    
    return prisma.promotion.findMany({
      where: {
        status: PromotionStatus.ACTIVE,
        AND: [
          // Date constraints
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } }
            ]
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          },
          // Usage constraints
          {
            OR: [
              { usageLimit: null },
              { usageCount: { lt: prisma.promotion.fields.usageLimit } }
            ]
          },
          // Product/Category targeting
          {
            OR: [
              // No specific targeting (applies to all)
              {
                applicableProducts: { isEmpty: true },
                applicableCategories: { isEmpty: true }
              },
              // Specific products
              {
                applicableProducts: { hasSome: productIds }
              },
              // Specific categories
              {
                applicableCategories: { hasSome: categoryIds }
              }
            ]
          }
        ]
      }
    })
  }
  
  /**
   * Get promotions from coupon codes
   */
  private static async getPromotionsFromCoupons(
    couponCodes: string[],
    userId?: string
  ): Promise<Promotion[]> {
    if (couponCodes.length === 0) return []
    
    const coupons = await prisma.coupon.findMany({
      where: {
        code: { in: couponCodes },
        active: true,
        OR: [
          { assignedToUserId: null },
          { assignedToUserId: userId }
        ]
      },
      include: {
        promotion: true
      }
    })
    
    return coupons
      .filter(coupon => {
        // Check coupon specific limits
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          return false
        }
        
        // Check date constraints
        const now = new Date()
        if (coupon.startDate && coupon.startDate > now) return false
        if (coupon.endDate && coupon.endDate < now) return false
        
        return true
      })
      .map(coupon => coupon.promotion)
  }
  
  /**
   * Calculate a single promotion
   */
  private static async calculateSinglePromotion(
    promotion: Promotion,
    availableItems: CartItem[],
    cart: CartSummary
  ): Promise<PromotionCalculation | null> {
    // Check if promotion conditions are met
    if (!this.checkPromotionConditions(promotion, cart)) {
      return null
    }
    
    // Check user-specific conditions
    if (!await this.checkUserConditions(promotion, cart.user)) {
      return null
    }
    
    const applicableItems = this.getApplicableItems(promotion, availableItems)
    
    if (applicableItems.length === 0) {
      return null
    }
    
    let discountAmount = 0
    let freeShipping = false
    let description = promotion.description || promotion.name
    
    switch (promotion.type) {
      case PromotionType.PERCENTAGE:
        const itemsTotal = applicableItems.reduce(
          (sum, item) => sum + (item.price * item.quantity), 0
        )
        discountAmount = itemsTotal * (promotion.discountValue / 100)
        
        // Apply maximum discount limit
        if (promotion.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, promotion.maxDiscountAmount)
        }
        
        description = `${promotion.discountValue}% off`
        break
        
      case PromotionType.FIXED_AMOUNT:
        discountAmount = promotion.discountValue
        description = `AED ${promotion.discountValue} off`
        break
        
      case PromotionType.FREE_SHIPPING:
        freeShipping = true
        description = 'Free shipping'
        break
        
      case PromotionType.BUY_X_GET_Y:
        discountAmount = this.calculateBuyXGetY(promotion, applicableItems)
        description = `Buy ${promotion.buyQuantity} get ${promotion.getQuantity} free`
        break
        
      case PromotionType.BULK_DISCOUNT:
        discountAmount = this.calculateBulkDiscount(promotion, applicableItems)
        description = `Bulk discount - ${promotion.discountValue}% off`
        break
    }
    
    return {
      promotionId: promotion.id,
      promotionName: promotion.name,
      promotionCode: promotion.code || undefined,
      discountAmount,
      freeShipping,
      applicableItems: applicableItems.map(item => item.productId),
      description
    }
  }
  
  /**
   * Check if promotion conditions are met
   */
  private static checkPromotionConditions(
    promotion: Promotion,
    cart: CartSummary
  ): boolean {
    // Check minimum order value
    if (promotion.minimumOrderValue && cart.subtotal < promotion.minimumOrderValue) {
      return false
    }
    
    // Check maximum order value
    if (promotion.maximumOrderValue && cart.subtotal > promotion.maximumOrderValue) {
      return false
    }
    
    // Check minimum quantity
    if (promotion.minimumQuantity) {
      const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0)
      if (totalQuantity < promotion.minimumQuantity) {
        return false
      }
    }
    
    // Check maximum quantity
    if (promotion.maximumQuantity) {
      const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0)
      if (totalQuantity > promotion.maximumQuantity) {
        return false
      }
    }
    
    return true
  }
  
  /**
   * Check user-specific conditions
   */
  private static async checkUserConditions(
    promotion: Promotion,
    user?: Pick<User, 'id' | 'role' | 'email' | 'createdAt'>
  ): Promise<boolean> {
    if (!user) return false
    
    // Check customer segments
    if (promotion.customerSegments.length > 0) {
      const userSegments = await prisma.customerSegment.findMany({
        where: {
          users: {
            some: { id: user.id }
          }
        }
      })
      
      const userSegmentIds = userSegments.map(s => s.id)
      const hasMatchingSegment = promotion.customerSegments.some(
        segmentId => userSegmentIds.includes(segmentId)
      )
      
      if (!hasMatchingSegment) {
        return false
      }
    }
    
    // Check first order condition
    if (promotion.targetType === PromotionTargetType.FIRST_ORDER) {
      const orderCount = await prisma.order.count({
        where: { 
          userId: user.id,
          status: { not: 'CANCELLED' }
        }
      })
      
      if (orderCount > 0) {
        return false
      }
    }
    
    // Check usage limit per customer
    if (promotion.usageLimitPerCustomer) {
      const usageCount = await prisma.promotionUsage.count({
        where: {
          promotionId: promotion.id,
          userId: user.id
        }
      })
      
      if (usageCount >= promotion.usageLimitPerCustomer) {
        return false
      }
    }
    
    return true
  }
  
  /**
   * Get applicable items for a promotion
   */
  private static getApplicableItems(
    promotion: Promotion,
    items: CartItem[]
  ): CartItem[] {
    let applicableItems = items
    
    // Filter by applicable products
    if (promotion.applicableProducts.length > 0) {
      applicableItems = applicableItems.filter(item =>
        promotion.applicableProducts.includes(item.productId)
      )
    }
    
    // Filter by applicable categories
    if (promotion.applicableCategories.length > 0) {
      applicableItems = applicableItems.filter(item =>
        item.product && promotion.applicableCategories.includes(item.product.categoryId)
      )
    }
    
    // Exclude specific products
    if (promotion.excludeProducts.length > 0) {
      applicableItems = applicableItems.filter(item =>
        !promotion.excludeProducts.includes(item.productId)
      )
    }
    
    // Exclude specific categories
    if (promotion.excludeCategories.length > 0) {
      applicableItems = applicableItems.filter(item =>
        !item.product || !promotion.excludeCategories.includes(item.product.categoryId)
      )
    }
    
    return applicableItems
  }
  
  /**
   * Calculate Buy X Get Y discount
   */
  private static calculateBuyXGetY(
    promotion: Promotion,
    items: CartItem[]
  ): number {
    if (!promotion.buyQuantity || !promotion.getQuantity) return 0
    
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const eligibleSets = Math.floor(totalQuantity / promotion.buyQuantity)
    const freeItems = eligibleSets * promotion.getQuantity
    
    // Sort items by price (descending) to give discount on most expensive items
    const sortedItems = [...items].sort((a, b) => b.price - a.price)
    
    let remainingFreeItems = freeItems
    let discount = 0
    
    for (const item of sortedItems) {
      if (remainingFreeItems <= 0) break
      
      const itemsToDiscount = Math.min(remainingFreeItems, item.quantity)
      const discountPercent = promotion.getDiscountPercent || 100
      
      discount += item.price * itemsToDiscount * (discountPercent / 100)
      remainingFreeItems -= itemsToDiscount
    }
    
    return discount
  }
  
  /**
   * Calculate bulk discount
   */
  private static calculateBulkDiscount(
    promotion: Promotion,
    items: CartItem[]
  ): number {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    
    if (promotion.minimumQuantity && totalQuantity < promotion.minimumQuantity) {
      return 0
    }
    
    const itemsTotal = items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    )
    
    return itemsTotal * (promotion.discountValue / 100)
  }
  
  /**
   * Calculate shipping cost
   */
  private static calculateShipping(cart: CartSummary): number {
    // Simple shipping calculation - can be made more complex
    const baseShipping = 10
    const freeShippingThreshold = 200
    
    return cart.subtotal >= freeShippingThreshold ? 0 : baseShipping
  }
  
  /**
   * Calculate tax
   */
  private static calculateTax(taxableAmount: number): number {
    // Simple tax calculation - 10% VAT
    return taxableAmount * 0.1
  }
  
  /**
   * Record promotion usage
   */
  static async recordPromotionUsage(
    promotionId: string,
    userId: string,
    orderId: string,
    discountAmount: number
  ): Promise<void> {
    await prisma.promotionUsage.create({
      data: {
        promotionId,
        userId,
        orderId,
        discountAmount
      }
    })
    
    // Update promotion usage count
    await prisma.promotion.update({
      where: { id: promotionId },
      data: {
        usageCount: {
          increment: 1
        }
      }
    })
  }
  
  /**
   * Validate coupon code
   */
  static async validateCouponCode(
    code: string,
    userId?: string
  ): Promise<{
    valid: boolean
    promotion?: Promotion
    message?: string
  }> {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
      include: { promotion: true }
    })
    
    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' }
    }
    
    if (!coupon.active) {
      return { valid: false, message: 'This coupon is no longer active' }
    }
    
    // Check assignment
    if (coupon.assignedToUserId && coupon.assignedToUserId !== userId) {
      return { valid: false, message: 'This coupon is not assigned to your account' }
    }
    
    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: 'This coupon has reached its usage limit' }
    }
    
    // Check dates
    const now = new Date()
    if (coupon.startDate && coupon.startDate > now) {
      return { valid: false, message: 'This coupon is not yet active' }
    }
    
    if (coupon.endDate && coupon.endDate < now) {
      return { valid: false, message: 'This coupon has expired' }
    }
    
    // Check promotion status
    if (coupon.promotion.status !== PromotionStatus.ACTIVE) {
      return { valid: false, message: 'The associated promotion is not active' }
    }
    
    return { 
      valid: true, 
      promotion: coupon.promotion,
      message: 'Coupon is valid'
    }
  }
}
