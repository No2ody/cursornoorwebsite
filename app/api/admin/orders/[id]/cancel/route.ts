import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { cancelOrder } from '@/lib/order-management'
import { z } from 'zod'

const cancelOrderSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
  notes: z.string().optional(),
})

export async function POST(
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
    const { reason, notes } = cancelOrderSchema.parse(body)

    const cancelledOrder = await cancelOrder({
      orderId,
      reason,
      notes,
      cancelledBy: session.user.id,
      actorName: session.user.name || session.user.email || 'Admin',
    })

    return NextResponse.json({ 
      success: true, 
      order: cancelledOrder,
      message: 'Order cancelled successfully'
    })
  } catch (error) {
    console.error('Cancel order error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to cancel order'
      },
      { status: 500 }
    )
  }
}
