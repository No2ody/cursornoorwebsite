import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getOrderDetails, updateOrderStatus } from '@/lib/order-management'
import { z } from 'zod'
import { OrderStatus } from '@prisma/client'

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  notes: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
  customerNotes: z.string().optional(),
})

// GET /api/admin/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: orderId } = await params

    const order = await getOrderDetails(orderId)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Get order details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: orderId } = await params
    const body = await request.json()
    const validatedData = updateOrderSchema.parse(body)

    let updatedOrder

    if (validatedData.status) {
      // Update status with timeline tracking
      updatedOrder = await updateOrderStatus({
        orderId,
        status: validatedData.status,
        notes: validatedData.notes,
        actorId: session.user.id,
        actorName: session.user.name || session.user.email || 'Admin',
      })
    } else {
      // Update other fields without status change
      const prisma = (await import('@/lib/prisma')).default
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          ...(validatedData.notes && { notes: validatedData.notes }),
          ...(validatedData.trackingNumber && { trackingNumber: validatedData.trackingNumber }),
          ...(validatedData.estimatedDelivery && { 
            estimatedDelivery: new Date(validatedData.estimatedDelivery) 
          }),
          ...(validatedData.customerNotes && { customerNotes: validatedData.customerNotes }),
        },
      })

      // Add timeline event for non-status updates
      if (validatedData.trackingNumber || validatedData.estimatedDelivery || validatedData.notes) {
        const { addOrderTimelineEvent } = await import('@/lib/order-management')
        await addOrderTimelineEvent({
          orderId,
          event: 'NOTE_ADDED' as any,
          title: 'Order updated',
          description: validatedData.notes || 'Order information updated',
          actorType: 'ADMIN' as any,
          actorId: session.user.id,
          actorName: session.user.name || session.user.email || 'Admin',
          metadata: {
            updatedFields: Object.keys(validatedData).filter(key => validatedData[key as keyof typeof validatedData]),
          },
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      message: 'Order updated successfully'
    })
  } catch (error) {
    console.error('Update order error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update order'
      },
      { status: 500 }
    )
  }
}
