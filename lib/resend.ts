import { Resend } from 'resend'

// Initialize Resend only if API key is available
export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Email configuration
export const EMAIL_CONFIG = {
  from: 'Noor AlTayseer <orders@nooraltayseer.com>',
  replyTo: 'info@nooraltayseer.com',
  domain: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const

// Email templates type
export interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
    image?: string
  }>
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  estimatedDelivery: string
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!resend) {
    console.warn('Resend not configured - email sending skipped')
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [data.customerEmail],
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `Order Confirmation #${data.orderNumber} - Noor AlTayseer`,
      react: OrderConfirmationEmail(data),
    })

    if (error) {
      console.error('Failed to send order confirmation email:', error)
      throw new Error(`Email send failed: ${error.message}`)
    }

    console.log('Order confirmation email sent successfully:', emailData?.id)
    return { success: true, emailId: emailData?.id }
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    throw error
  }
}

// Dynamic import for the email component to avoid issues during build
async function OrderConfirmationEmail(data: OrderEmailData) {
  const { OrderConfirmationEmail } = await import('@/components/emails/order-confirmation')
  return OrderConfirmationEmail(data)
}
