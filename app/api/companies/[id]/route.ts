import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getCompanyDetails, getUserCompanyContext } from '@/lib/company-management'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
})

// GET /api/companies/[id] - Get company details
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

    const company = await getCompanyDetails(companyId)

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({ company })
  } catch (error) {
    console.error('Get company details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company details' },
      { status: 500 }
    )
  }
}

// PUT /api/companies/[id] - Update company details
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
    const validatedData = updateCompanySchema.parse(body)

    // Verify user has permission to update company
    const userContext = await getUserCompanyContext(session.user.id)
    
    if (!userContext.company || userContext.company.id !== companyId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!userContext.permissions?.canManageCompany) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: validatedData,
    })

    return NextResponse.json({ 
      success: true, 
      company: updatedCompany,
      message: 'Company updated successfully'
    })
  } catch (error) {
    console.error('Update company error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update company'
      },
      { status: 500 }
    )
  }
}
