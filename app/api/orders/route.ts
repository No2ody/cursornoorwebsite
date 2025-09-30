import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateInput } from '@/lib/validation'
import { requireAuth, auditLog, applySecurityHeaders } from '@/lib/authorization'
import { z } from 'zod'

interface CartItem {
  id: string
  productId: string
  quantity: number
  price: number
}

interface ShippingInfo {
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

// Enhanced validation schema for order creation
const createOrderSchema = z.object({
  items: z.array(z.object({
    id: z.string().optional(),
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().min(1).max(999),
    price: z.number().positive().max(1000000),
  })).min(1, 'At least one item is required').max(50, 'Too many items'),
  shippingInfo: z.object({
    address: z.string().min(1, 'Address is required').max(200),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().min(1, 'State is required').max(100),
    zipCode: z.string().min(1, 'Zip code is required').max(20),
    country: z.string().min(1, 'Country is required').max(100),
  }),
  total: z.number().positive().max(1000000),
})

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const body = await req.json()
    
    // Validate input
    const validation = validateInput(createOrderSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }
    
    const { items, shippingInfo, total } = validation.data!

    // Verify all products exist and are in stock
    const productIds = items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    })

    // Check if all products exist
    if (products.length !== items.length) {
      const foundProductIds = products.map((p) => p.id)
      const missingProductIds = productIds.filter(
        (id) => !foundProductIds.includes(id)
      )
      return new NextResponse(
        `Products not found: ${missingProductIds.join(', ')}`,
        {
          status: 400,
        }
      )
    }

    // Check stock levels
    const insufficientStock = items.filter((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product && product.stock < item.quantity
    })

    if (insufficientStock.length > 0) {
      return new NextResponse(
        `Insufficient stock for products: ${insufficientStock
          .map((item) => item.productId)
          .join(', ')}`,
        { status: 400 }
      )
    }

    // Create shipping address
    const address = await prisma.address.create({
      data: {
        street: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        postalCode: shippingInfo.zipCode,
        country: shippingInfo.country,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    // Start a transaction to ensure all operations succeed or fail together
    const order = await prisma.$transaction(async (tx) => {
      // Create order with items
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          addressId: address.id,
          total,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: true,
          shippingAddress: true,
        },
      })

      // Update product stock levels
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      // Clear the user's cart if it exists
      await tx.cart
        .delete({
          where: { userId: user.id },
        })
        .catch(() => {
          // Ignore error if cart doesn't exist
        })

      return newOrder
    })

    // Audit log the order creation
    await auditLog('CREATE_ORDER', 'order', order.id, user.id, {
      total,
      itemCount: items.length,
      shippingCity: shippingInfo.city,
    })

    const response = NextResponse.json({ orderId: order.id })
    return applySecurityHeaders(response)
  } catch (error) {
    console.error('[ORDERS_POST]', error)
    if (error instanceof Error) {
      return new NextResponse(`Error: ${error.message}`, { status: 500 })
    }
    return new NextResponse('Internal error', { status: 500 })
  }
}
