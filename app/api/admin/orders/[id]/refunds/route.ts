import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createRefund } from '@/lib/order-management'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const createRefundSchema = z.object({
  amount: z.number().positive('Refund amount must be positive'),
  type: z.enum(['FULL', 'PARTIAL', 'SHIPPING_ONLY', 'TAX_ONLY']),
  reason: z.string().min(1, 'Refund reason is required'),
  description: z.string().optional(),
  returnId: z.string().optional(),
})

// GET /api/admin/orders/[id]/refunds - Get refunds for an order
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

    const refunds = await prisma.orderRefund.findMany({
      where: { orderId },
      include: {
        return: {
          select: {
            id: true,
            returnNumber: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ refunds })
  } catch (error) {
    console.error('Get refunds error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch refunds' },
      { status: 500 }
    )
  }
}

// POST /api/admin/orders/[id]/refunds - Create a refund
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
    const { amount, type, reason, description, returnId } = createRefundSchema.parse(body)

    const refund = await createRefund({
      orderId,
      amount,
      type,
      reason,
      description,
      processedBy: session.user.id,
      actorName: session.user.name || session.user.email || 'Admin',
      returnId,
    })

    return NextResponse.json({ 
      success: true, 
      refund,
      message: 'Refund created successfully'
    })
  } catch (error) {
    console.error('Create refund error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create refund'
      },
      { status: 500 }
    )
  }
}
