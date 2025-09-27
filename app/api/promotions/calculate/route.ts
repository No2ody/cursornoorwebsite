import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { PromotionService, CartItem } from '@/lib/promotions'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const calculatePromotionsSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })),
  appliedCoupons: z.array(z.string()).optional().default([])
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    
    const { items, appliedCoupons } = calculatePromotionsSchema.parse(body)
    
    // Handle empty cart
    if (!items || items.length === 0) {
      return NextResponse.json({
        subtotal: 0,
        appliedPromotions: [],
        totalDiscount: 0,
        shippingCost: 0,
        taxAmount: 0,
        total: 0,
        availablePromotions: []
      })
    }
    
    // Fetch product details for the cart items
    const productIds = items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        categoryId: true,
        price: true
      }
    })
    
    // Enrich cart items with product data
    const enrichedItems: CartItem[] = items.map(item => {
      const product = products.find(p => p.id === item.productId)
      return {
        ...item,
        product: product || undefined
      }
    })
    
    // Calculate subtotal
    const subtotal = enrichedItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    )
    
    // Get user data if authenticated
    let user
    if (session?.user?.id) {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          role: true,
          email: true,
          createdAt: true
        }
      })
    }
    
    const cartSummary = {
      items: enrichedItems,
      subtotal,
      user: user || undefined
    }
    
    // Calculate promotions
    const result = await PromotionService.calculateCartPromotions(
      cartSummary,
      appliedCoupons
    )
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error calculating promotions:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to calculate promotions' },
      { status: 500 }
    )
  }
}
