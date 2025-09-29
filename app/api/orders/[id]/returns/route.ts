import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createReturnRequest } from '@/lib/order-management'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const createReturnRequestSchema = z.object({
  items: z.array(z.object({
    orderItemId: z.string(),
    quantity: z.number().positive(),
    reason: z.string().min(1),
    condition: z.string().optional(),
  })).min(1, 'At least one item must be selected for return'),
  reason: z.string().min(1, 'Return reason is required'),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional().default([]),
})

// GET /api/orders/[id]/returns - Get customer's returns for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: orderId } = await params

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        userId: session.user.id,
      },
      select: { id: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const returns = await prisma.orderReturn.findMany({
      where: { orderId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ returns })
  } catch (error) {
    console.error('Get customer returns error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch returns' },
      { status: 500 }
    )
  }
}

// POST /api/orders/[id]/returns - Create a return request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: orderId } = await params
    const body = await request.json()
    const { items, reason, description, images } = createReturnRequestSchema.parse(body)

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        userId: session.user.id,
      },
      select: { 
        id: true,
        status: true,
        createdAt: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if return window is still open (e.g., 30 days)
    const returnWindowDays = 30
    const returnWindowExpiry = new Date(order.createdAt)
    returnWindowExpiry.setDate(returnWindowExpiry.getDate() + returnWindowDays)

    if (new Date() > returnWindowExpiry) {
      return NextResponse.json(
        { error: `Return window has expired. Returns must be requested within ${returnWindowDays} days of order.` },
        { status: 400 }
      )
    }

    const returnRequest = await createReturnRequest({
      orderId,
      items,
      reason,
      description,
      images,
      requestedBy: session.user.id,
    })

    return NextResponse.json({ 
      success: true, 
      return: returnRequest,
      message: 'Return request created successfully'
    })
  } catch (error) {
    console.error('Create return request error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create return request'
      },
      { status: 500 }
    )
  }
}
