import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { KYCService } from '@/lib/kyc-service'
import { z } from 'zod'

const verificationSchema = z.object({
  approved: z.boolean(),
  notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Validate input
    const { approved, notes } = verificationSchema.parse(body)
    
    // Verify document
    const result = await KYCService.verifyDocument(id, session.user.id, approved, notes)
    
    return NextResponse.json({ 
      ...result,
      message: `Document ${approved ? 'approved' : 'rejected'} successfully` 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof Error && error.message === 'Document not found') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    console.error('Error verifying document:', error)
    return NextResponse.json(
      { error: 'Failed to verify document' },
      { status: 500 }
    )
  }
}
