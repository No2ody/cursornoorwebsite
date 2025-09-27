import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'
import { sendOrderConfirmationEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const orderId = session.metadata?.orderId
        const paymentIntentId = session.payment_intent

        if (!orderId) {
          console.error('No orderId in session metadata')
          return NextResponse.json({ error: 'No orderId found' }, { status: 400 })
        }

        // Update order status to delivered (payment completed)
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'DELIVERED',
            stripePaymentId: paymentIntentId as string,
          }
        })

        // Reduce product stock and get full order details for email
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { 
            items: {
              include: {
                product: true
              }
            },
            user: true,
            shippingAddress: true
          }
        })

        if (order) {
          // Update product stock
          for (const item of order.items) {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                }
              }
            })
          }

          // Send order confirmation email
          try {
            await sendOrderConfirmationEmail({
              orderNumber: order.id.slice(-8).toUpperCase(),
              customerName: order.user.name || 'Customer',
              customerEmail: order.user.email,
              items: order.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
                image: item.product.images[0]
              })),
              subtotal: order.total,
              shipping: 10, // Fixed shipping cost
              tax: order.total * 0.1, // 10% tax
              total: order.total + 10 + (order.total * 0.1),
              shippingAddress: {
                street: order.shippingAddress.street,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                postalCode: order.shippingAddress.postalCode,
                country: order.shippingAddress.country,
              },
              estimatedDelivery: '3-5 business days'
            })
            console.log(`Order confirmation email sent for order ${orderId}`)
          } catch (emailError) {
            console.error(`Failed to send order confirmation email for order ${orderId}:`, emailError)
            // Don't fail the webhook if email fails
          }
        }

        console.log(`Order ${orderId} completed successfully`)
        break
      }

      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': {
        const session = event.data.object
        const orderId = session.metadata?.orderId

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'CANCELLED',
            }
          })
          console.log(`Order ${orderId} cancelled due to payment failure/expiry`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata?.orderId

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'CANCELLED',
            }
          })
          console.log(`Order ${orderId} failed`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
