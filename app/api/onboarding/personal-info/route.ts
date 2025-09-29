import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { KYCService, personalInfoSchema } from '@/lib/kyc-service'
import { z } from 'zod'

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = personalInfoSchema.parse(body)
    
    // Update personal information
    const result = await KYCService.updatePersonalInfo(session.user.id, validatedData)
    
    return NextResponse.json({ 
      ...result,
      message: 'Personal information updated successfully' 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating personal info:', error)
    return NextResponse.json(
      { error: 'Failed to update personal information' },
      { status: 500 }
    )
  }
}
