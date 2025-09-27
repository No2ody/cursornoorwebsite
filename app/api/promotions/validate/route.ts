import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { PromotionService } from '@/lib/promotions'
import { z } from 'zod'

const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    
    const { code } = validateCouponSchema.parse(body)
    
    const result = await PromotionService.validateCouponCode(code, session?.user?.id)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error validating coupon:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, message: 'Invalid request format' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { valid: false, message: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}
