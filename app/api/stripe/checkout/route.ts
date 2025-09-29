import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { stripe, formatAmountForStripe, getAvailableStripePaymentMethods } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('[STRIPE_CHECKOUT] === REQUEST START ===')
    
    const session = await auth()
    if (!session?.user) {
      console.log('[STRIPE_CHECKOUT] Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[STRIPE_CHECKOUT] User authenticated:', session.user.id)

    const body = await request.json()
    const { items, shippingAddress, totalAmount, paymentMethods, currency = 'aed' } = body

    console.log('[STRIPE_CHECKOUT] Request body received')
    console.log('[STRIPE_CHECKOUT] Items count:', items?.length)
    console.log('[STRIPE_CHECKOUT] Total amount:', totalAmount)

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('[STRIPE_CHECKOUT] No items provided')
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Validate items and calculate total
    let calculatedTotal = 0
    const validatedItems = []

    console.log('[STRIPE_CHECKOUT] === DEBUGGING SERVER ===')
    console.log('[STRIPE_CHECKOUT] Received items:', items)
    console.log('[STRIPE_CHECKOUT] Received totalAmount:', totalAmount)

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

      console.log('[STRIPE_CHECKOUT] Product:', {
        id: product.id,
        name: product.name,
        dbPrice: product.price,
        quantity: item.quantity,
        lineTotal
      })

      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        total: lineTotal
      })
    }

    console.log('[STRIPE_CHECKOUT] Calculated server total:', calculatedTotal)
    console.log('[STRIPE_CHECKOUT] Frontend sent total:', totalAmount)
    console.log('[STRIPE_CHECKOUT] Difference:', Math.abs(calculatedTotal - totalAmount))
    console.log('[STRIPE_CHECKOUT] === END SERVER DEBUGGING ===')

    // Verify total amount matches (with more tolerance for floating point errors)
    const difference = Math.abs(calculatedTotal - totalAmount)
    const tolerance = 0.02 // Allow 2 cent difference for floating point precision
    
    if (difference > tolerance) {
      console.error('[STRIPE_CHECKOUT] TOTAL MISMATCH ERROR')
      console.error('Server calculated:', calculatedTotal)
      console.error('Client sent:', totalAmount)
      console.error('Difference:', difference)
      console.error('Tolerance:', tolerance)
      
      return NextResponse.json({ 
        error: 'Total amount mismatch',
        serverCalculated: calculatedTotal,
        clientSent: totalAmount,
        difference: difference,
        details: 'Product prices may have changed or there is a calculation error'
      }, { status: 400 })
    }

    // Create a default address for now (this should be improved to use real user addresses)
    const defaultAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        street: shippingAddress?.address || 'To be collected by Stripe',
        city: shippingAddress?.city || 'Dubai',
        state: shippingAddress?.state || 'Dubai',
        postalCode: shippingAddress?.zipCode || '00000',
        country: shippingAddress?.country || 'UAE',
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

    // Get available payment methods for this order
    const availablePaymentMethods = paymentMethods || getAvailableStripePaymentMethods(totalAmount, currency)
    
    // Create Stripe checkout session with enhanced payment options
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: availablePaymentMethods,
      customer_email: session.user.email || undefined,
      line_items: validatedItems.map(item => ({
        price_data: {
          currency: currency.toLowerCase(),
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
        currency: currency.toUpperCase(),
      },
      success_url: `${origin}/order-confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      shipping_address_collection: {
        allowed_countries: ['AE', 'US', 'GB', 'DE', 'FR'], // Expanded country support
      },
      // Enhanced checkout features
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      // Enable automatic tax calculation (if configured)
      automatic_tax: {
        enabled: false, // Set to true when tax calculation is set up
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Custom fields for business customers
      custom_fields: [
        {
          key: 'business_name',
          label: {
            type: 'custom',
            custom: 'Business Name (Optional)',
          },
          type: 'text',
          optional: true,
        },
        {
          key: 'vat_number',
          label: {
            type: 'custom',
            custom: 'VAT Number (Optional)',
          },
          type: 'text',
          optional: true,
        }
      ],
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
    console.error('[STRIPE_CHECKOUT] === ERROR OCCURRED ===')
    console.error('[STRIPE_CHECKOUT] Error details:', error)
    console.error('[STRIPE_CHECKOUT] Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('[STRIPE_CHECKOUT] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
