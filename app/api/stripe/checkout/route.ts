import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items, shippingAddress, totalAmount } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Validate items and calculate total
    let calculatedTotal = 0
    const validatedItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        }, { status: 400 })
      }

      const lineTotal = product.price * item.quantity
      calculatedTotal += lineTotal

      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        total: lineTotal
      })
    }

    // Verify total amount matches
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return NextResponse.json({ error: 'Total amount mismatch' }, { status: 400 })
    }

    // Create a default address for now (this should be improved to use real user addresses)
    const defaultAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        street: shippingAddress.address || 'Default Address',
        city: shippingAddress.city || 'Dubai',
        state: shippingAddress.state || 'Dubai',
        postalCode: shippingAddress.zipCode || '00000',
        country: shippingAddress.country || 'UAE',
        isDefault: true
      }
    })

    // Create order in database first
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total: calculatedTotal,
        status: 'PENDING',
        addressId: defaultAddress.id,
        items: {
          create: validatedItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Get the current URL origin
    const headersList = await headers()
    const origin = headersList.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: session.user.email || undefined,
      line_items: validatedItems.map(item => ({
        price_data: {
          currency: 'aed',
          product_data: {
            name: item.name,
            metadata: {
              productId: item.productId
            }
          },
          unit_amount: formatAmountForStripe(item.price),
        },
        quantity: item.quantity,
      })),
      metadata: {
        orderId: order.id,
        userId: session.user.id,
      },
      success_url: `${origin}/order-confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      shipping_address_collection: {
        allowed_countries: ['AE'], // UAE only for now
      },
    })

    // Update order with Stripe payment ID
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        stripePaymentId: checkoutSession.payment_intent as string
      }
    })

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      orderId: order.id
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
