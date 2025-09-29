import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { KYCService, businessInfoSchema } from '@/lib/kyc-service'
import { z } from 'zod'

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = businessInfoSchema.parse(body)
    
    // Update business information
    const result = await KYCService.updateBusinessInfo(session.user.id, validatedData)
    
    return NextResponse.json({ 
      ...result,
      message: 'Business information updated successfully' 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating business info:', error)
    return NextResponse.json(
      { error: 'Failed to update business information' },
      { status: 500 }
    )
  }
}
