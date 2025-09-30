import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import Stripe from 'stripe'
import { validateInput, commonSchemas } from '@/lib/validation'
import { withPaymentRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Validate Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Input validation schema for payment
const paymentSchema = z.object({
  orderId: commonSchemas.id,
  amount: z.number().positive().max(1000000).optional(), // Optional override
})

export const POST = withPaymentRateLimit(async (req: NextRequest) => {
  try {
    const session = await auth()

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    
    // Validate input
    const validation = validateInput(paymentSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }
    
    const { orderId } = validation.data!

    // Get the order
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
    })

    if (!order) {
      return new NextResponse('Order not found', { status: 404 })
    }

    // If order is already paid, return error
    if (order.stripePaymentId) {
      return new NextResponse('Order is already paid', { status: 400 })
    }

    // Calculate final amount including tax and shipping
    const subtotal = order.total
    const shipping = 10 // Fixed shipping cost
    const tax = subtotal * 0.1 // 10% tax
    const total = Math.round((subtotal + shipping + tax) * 100) // Convert to cents

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'aed',
      metadata: {
        orderId: order.id,
        userId: session.user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Update order with payment intent ID
    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        stripePaymentId: paymentIntent.id,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('[PAYMENT_ERROR]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
})
