import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reorderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required')
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId } = reorderSchema.parse(body)

    // Get the original order with items
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                stock: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check product availability and prepare cart items
    const cartItems = []
    const unavailableItems = []

    for (const item of order.items) {
      if (item.product.stock >= item.quantity) {
        cartItems.push({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.images[0] || '/placeholder.png',
          quantity: item.quantity
        })
      } else {
        unavailableItems.push({
          name: item.product.name,
          requestedQuantity: item.quantity,
          availableStock: item.product.stock
        })
      }
    }

    return NextResponse.json({
      success: true,
      cartItems,
      unavailableItems,
      message: unavailableItems.length > 0 
        ? `${cartItems.length} items added to cart. ${unavailableItems.length} items are currently out of stock.`
        : `All ${cartItems.length} items added to cart successfully.`
    })

  } catch (error) {
    console.error('Error processing reorder:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process reorder' },
      { status: 500 }
    )
  }
}
