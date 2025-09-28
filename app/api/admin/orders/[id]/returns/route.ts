import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { processReturnRequest } from '@/lib/order-management'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const processReturnSchema = z.object({
  returnId: z.string(),
  approved: z.boolean(),
  reviewNotes: z.string().optional(),
})

// GET /api/admin/orders/[id]/returns - Get returns for an order
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

    const returns = await prisma.orderReturn.findMany({
      where: { orderId },
      include: {
        items: {
          include: {
            orderItem: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ returns })
  } catch (error) {
    console.error('Get returns error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch returns' },
      { status: 500 }
    )
  }
}

// POST /api/admin/orders/[id]/returns - Process a return request
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

    // const { id: orderId } = await params
    const body = await request.json()
    const { returnId, approved, reviewNotes } = processReturnSchema.parse(body)

    const processedReturn = await processReturnRequest({
      returnId,
      approved,
      reviewNotes,
      reviewedBy: session.user.id,
      actorName: session.user.name || session.user.email || 'Admin',
    })

    return NextResponse.json({ 
      success: true, 
      return: processedReturn,
      message: `Return request ${approved ? 'approved' : 'rejected'} successfully`
    })
  } catch (error) {
    console.error('Process return error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process return'
      },
      { status: 500 }
    )
  }
}
