import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { KYCService, documentUploadSchema } from '@/lib/kyc-service'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = documentUploadSchema.parse(body)
    
    // Upload document
    const document = await KYCService.uploadDocument(session.user.id, validatedData)
    
    return NextResponse.json({ 
      document,
      message: 'Document uploaded successfully' 
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof Error && error.message.includes('already uploaded')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}
