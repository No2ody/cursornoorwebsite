import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { 
  updateCompanySettings, 
  updateCompanySettingsSchema,
  getUserCompanyContext 
} from '@/lib/company-management'
import { z } from 'zod'

// GET /api/companies/[id]/settings - Get company settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId } = await params

    // Verify user has access to this company
    const userContext = await getUserCompanyContext(session.user.id)
    
    if (!userContext.company || userContext.company.id !== companyId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const prisma = (await import('@/lib/prisma')).default
    const settings = await prisma.companySettings.findUnique({
      where: { companyId },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get company settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company settings' },
      { status: 500 }
    )
  }
}

// PUT /api/companies/[id]/settings - Update company settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId } = await params
    const body = await request.json()
    const validatedData = updateCompanySettingsSchema.parse(body)

    const updatedSettings = await updateCompanySettings({
      companyId,
      userId: session.user.id,
      settings: validatedData,
    })

    return NextResponse.json({ 
      success: true, 
      settings: updatedSettings,
      message: 'Company settings updated successfully'
    })
  } catch (error) {
    console.error('Update company settings error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update settings'
      },
      { status: 500 }
    )
  }
}
