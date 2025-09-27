import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
})

// Client-side Stripe instance
export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
  }
  
  return window.Stripe ? window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) : null
}

// Helper function to format currency for Stripe (cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100) // Convert to cents
}

// Helper function to format currency for display
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100 // Convert from cents
}